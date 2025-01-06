import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { WebhookEvent } from "@clerk/nextjs/server"
import crypto from 'crypto'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.test' })

// Debug logging
console.log('Environment check:', {
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  hasClerkSecret: !!process.env.CLERK_WEBHOOK_SECRET,
  hasStripeSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
})

// Initialize clients with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia"
})

// Helper function to generate UUID
function generateUUID() {
  return crypto.randomUUID()
}

// Test data
const TEST_USER_ID = generateUUID()
const TEST_EMAIL = `test_${Date.now()}@example.com`

// Helper function to generate webhook signature
function generateWebhookSignature(payload: any) {
  const timestamp = Math.floor(Date.now() / 1000)
  const secret = process.env.CLERK_WEBHOOK_SECRET!
  
  // Convert payload to string
  const payloadString = JSON.stringify(payload)
  
  // Create HMAC
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(`${timestamp}.${payloadString}`)
  const signature = hmac.digest('hex')
  
  return {
    timestamp,
    signature: `v1,${signature}`,
    payloadString
  }
}

// Helper function to generate Stripe webhook signature
function generateStripeSignature(payload: any) {
  const timestamp = Math.floor(Date.now() / 1000)
  const secret = process.env.STRIPE_WEBHOOK_SECRET!
  
  // Convert payload to string
  const payloadString = JSON.stringify(payload)
  
  // Create HMAC
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(`${timestamp}.${payloadString}`)
  const signature = hmac.digest('hex')
  
  return {
    timestamp,
    signature: `t=${timestamp},v1=${signature}`,
    payloadString
  }
}

describe('Integration Tests', () => {
  // Cleanup before each test
  beforeEach(async () => {
    console.log('Cleaning up before test...')
    const cleanupTables = ['subscriptions', 'customers', 'marketing_plans']
    for (const table of cleanupTables) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('user_id', TEST_USER_ID)
      
      if (error) {
        console.error(`Error cleaning up ${table}:`, error)
      }
    }
  })

  // Create initial test data
  beforeAll(async () => {
    console.log('Setting up test data...')
    console.log('Test User ID:', TEST_USER_ID)
    
    // Create test subscription
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        id: crypto.randomUUID(),
        user_id: TEST_USER_ID,
        tier: 'free',
        status: 'active',
        current_period_end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        plan_generations_left: 1,
        max_plan_generations: 1,
      })

    if (error) {
      console.error('Error creating test subscription:', error)
      throw error
    }

    console.log('Test data setup complete')
  })

  // Cleanup after tests
  afterAll(async () => {
    console.log('Cleaning up test data...')
    
    const cleanupTables = ['subscriptions', 'customers', 'marketing_plans']
    for (const table of cleanupTables) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('user_id', TEST_USER_ID)
      
      if (error) {
        console.error(`Error cleaning up ${table}:`, error)
      }
    }

    console.log('Cleanup complete')
  })

  describe('User Creation Flow', () => {
    it('should create a free subscription when user signs up', async () => {
      // Create webhook payload matching Clerk's format
      const webhookData = {
        data: {
          id: TEST_USER_ID,
          email_addresses: [{ email_address: TEST_EMAIL }],
          first_name: 'Test',
          last_name: 'User'
        },
        type: 'user.created'
      }

      // Generate proper Clerk webhook signature
      const { timestamp, signature, payloadString } = generateWebhookSignature(webhookData)

      const response = await fetch('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': crypto.randomUUID(),
          'svix-timestamp': timestamp.toString(),
          'svix-signature': signature
        },
        body: payloadString
      })

      if (!response.ok) {
        const text = await response.text()
        console.error('Webhook response:', text)
        throw new Error(`Webhook request failed: ${text}`)
      }

      // Wait a bit for the database operation to complete
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Verify customer was created
      const { data: customer, error: customerError } = await supabaseAdmin
        .from('customers')
        .select()
        .eq('user_id', TEST_USER_ID)
        .single()

      if (customerError) {
        console.error('Error fetching customer:', customerError)
        throw customerError
      }

      expect(customer).toBeTruthy()
      expect(customer.stripe_customer_id).toMatch(/^temp_/)

      // Verify subscription was created
      const { data: subscription, error: subscriptionError } = await supabaseAdmin
        .from('subscriptions')
        .select()
        .eq('user_id', TEST_USER_ID)
        .single()

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError)
        throw subscriptionError
      }

      expect(subscription).toBeTruthy()
      expect(subscription.tier).toBe('free')
      expect(subscription.status).toBe('active')
      expect(subscription.plan_generations_left).toBe(1)
    })
  })

  describe('Subscription Management', () => {
    it('should handle subscription upgrades correctly', async () => {
      // Create test customer first
      const { error: customerError } = await supabaseAdmin
        .from('customers')
        .insert({
          id: crypto.randomUUID(),
          user_id: TEST_USER_ID,
          stripe_customer_id: 'temp_' + crypto.randomUUID() // Temporary ID until Stripe updates it
        })

      if (customerError) {
        console.error('Error creating test customer:', customerError)
        throw customerError
      }

      // Create test subscription
      const { error: subscriptionError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          id: crypto.randomUUID(),
          user_id: TEST_USER_ID,
          tier: 'free',
          status: 'active',
          current_period_end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          plan_generations_left: 1,
          max_plan_generations: 1,
        })

      if (subscriptionError) {
        console.error('Error creating test subscription:', subscriptionError)
        throw subscriptionError
      }

      // Simulate Stripe webhook for upgrade
      const session = {
        id: crypto.randomUUID(),
        customer: crypto.randomUUID(),
        subscription: crypto.randomUUID(),
        metadata: {
          userId: TEST_USER_ID,
          tier: 'growth-pro'
        },
        object: 'checkout.session',
        payment_status: 'paid',
        status: 'complete',
        mode: 'subscription',
        client_reference_id: TEST_USER_ID,
        subscription_data: {
          status: 'active'
        }
      }

      const { timestamp, signature, payloadString } = generateStripeSignature({
        id: crypto.randomUUID(),
        type: 'checkout.session.completed',
        data: { 
          object: session
        },
        created: Math.floor(Date.now() / 1000)
      })

      const stripeResponse = await fetch('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': signature
        },
        body: payloadString
      })

      if (!stripeResponse.ok) {
        const text = await stripeResponse.text()
        console.error('Stripe webhook response:', text)
        throw new Error(`Stripe webhook failed: ${text}`)
      }

      // Wait a bit for the database operation to complete
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Verify customer was updated
      const { data: updatedCustomer, error: customerFetchError } = await supabaseAdmin
        .from('customers')
        .select()
        .eq('user_id', TEST_USER_ID)
        .single()

      if (customerFetchError) {
        console.error('Error fetching updated customer:', customerFetchError)
        throw customerFetchError
      }

      expect(updatedCustomer).toBeTruthy()
      expect(updatedCustomer.stripe_customer_id).toBe(session.customer)

      // Verify subscription was upgraded
      const { data: updatedSubscription, error } = await supabaseAdmin
        .from('subscriptions')
        .select()
        .eq('user_id', TEST_USER_ID)
        .single()

      if (error) {
        console.error('Error fetching updated subscription:', error)
        throw error
      }

      expect(updatedSubscription).toBeTruthy()
      expect(updatedSubscription.tier).toBe('growth-pro')
      expect(updatedSubscription.stripe_subscription_id).toBe(session.subscription)
      expect(updatedSubscription.plan_generations_left).toBe(10)
      expect(updatedSubscription.max_plan_generations).toBe(10)
    })
  })

  describe('Marketing Plan Management', () => {
    it('should save marketing plans correctly', async () => {
      // Create test marketing plan directly
      const plan = {
        id: crypto.randomUUID(),
        user_id: TEST_USER_ID,
        business_name: 'Test Business',
        industry: 'Technology',
        plan: 'Test marketing plan content'
      }

      const { error: createError } = await supabaseAdmin
        .from('marketing_plans')
        .insert(plan)

      if (createError) {
        console.error('Error creating marketing plan:', createError)
        throw createError
      }

      // Verify plan was saved
      const { data: savedPlan, error } = await supabaseAdmin
        .from('marketing_plans')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .single()

      if (error) {
        console.error('Error fetching saved plan:', error)
        throw error
      }

      expect(savedPlan).toBeTruthy()
      expect(savedPlan.business_name).toBe(plan.business_name)
      expect(savedPlan.industry).toBe(plan.industry)
      expect(savedPlan.plan).toBe(plan.plan)
    })
  })

  describe('Subscription Expiration', () => {
    it('should keep subscription active until explicitly canceled', async () => {
      // Clean up any existing subscriptions first
      await supabaseAdmin
        .from('subscriptions')
        .delete()
        .eq('user_id', TEST_USER_ID)

      // Create an active paid subscription
      const activeSubscription = {
        id: crypto.randomUUID(),
        user_id: TEST_USER_ID,
        tier: 'growth-pro',
        status: 'active',
        current_period_end: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        plan_generations_left: 10,
        max_plan_generations: 10,
      }

      const { error: createError } = await supabaseAdmin
        .from('subscriptions')
        .insert(activeSubscription)

      if (createError) {
        console.error('Error creating subscription:', createError)
        throw createError
      }

      // Verify subscription was created with past end date
      const { data: createdSub } = await supabaseAdmin
        .from('subscriptions')
        .select()
        .eq('id', activeSubscription.id)
        .single()

      console.log('Created subscription:', {
        id: createdSub.id,
        tier: createdSub.tier,
        current_period_end: createdSub.current_period_end,
        now: new Date().toISOString()
      })

      // Simulate subscription check webhook
      const webhookUrl = 'http://localhost:3000/api/webhooks/subscription-check'
      console.log('Sending request to:', webhookUrl)

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          data: {
            id: TEST_USER_ID
          }
        })
      })

      if (!response.ok) {
        const text = await response.text()
        console.error('Response status:', response.status)
        console.error('Response headers:', Object.fromEntries(response.headers))
        console.error('Response body:', text)
        throw new Error(`Subscription check failed: ${response.status} ${response.statusText}\nBody: ${text}`)
      }

      const responseData = await response.json()
      console.log('Webhook response:', responseData)

      // Wait a bit for any database operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Verify subscription remains active and unchanged
      const { data: subscription, error } = await supabaseAdmin
        .from('subscriptions')
        .select()
        .eq('id', activeSubscription.id)
        .single()

      if (error) {
        console.error('Error fetching subscription:', error)
        throw error
      }

      console.log('Final subscription state:', subscription)

      expect(subscription).toBeTruthy()
      expect(subscription.tier).toBe('growth-pro') // Should remain on pro tier
      expect(subscription.status).toBe('active') // Should remain active
      expect(subscription.plan_generations_left).toBe(10) // Should remain unchanged
      expect(subscription.max_plan_generations).toBe(10) // Should remain unchanged
    })
  })
}) 