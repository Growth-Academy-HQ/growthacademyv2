import chalk from 'chalk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const CLERK_API_BASE = 'https://api.clerk.dev/v1'
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY

// Generate a unique identifier for test users
const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2)

async function createTestUser() {
  const response = await fetch(`${CLERK_API_BASE}/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email_address: [`test_${uniqueId}@growth-academy.com`],
      password: 'test-password-123',
      first_name: 'Test',
      last_name: 'User',
      username: `test_user_${uniqueId}`
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Error response:', errorText)
    throw new Error(`Failed to create test user: ${errorText}`)
  }

  return await response.json()
}

async function createTestSession(userId: string) {
  const response = await fetch(`${CLERK_API_BASE}/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: userId,
      expire_in_seconds: 3600 // 1 hour
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Error response:', errorText)
    throw new Error(`Failed to create test session: ${errorText}`)
  }

  return await response.json()
}

async function deleteTestUser(userId: string) {
  const response = await fetch(`${CLERK_API_BASE}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Error response:', errorText)
    throw new Error(`Failed to delete test user: ${errorText}`)
  }
}

async function testAPI() {
  console.log(chalk.blue('\n🚀 Starting API Tests...\n'))

  try {
    // Create a test user
    console.log(chalk.yellow('👤 Creating test user...'))
    const testUser = await createTestUser()
    console.log(chalk.green('✓ Test user created:', testUser.id))

    // Create a test session
    console.log(chalk.yellow('🔑 Creating test session...'))
    const session = await createTestSession(testUser.id)
    console.log(chalk.green('✓ Test session created'))
    console.log('Session details:', JSON.stringify(session, null, 2))

    const baseUrl = 'http://localhost:3001/api'
    const headers = {
      'Authorization': `Bearer ${session.id}`,
      'Content-Type': 'application/json'
    }
    console.log('Request headers:', headers)

    // Test Marketing Plans API
    console.log(chalk.yellow('\n📊 Testing Marketing Plans API...'))
    
    try {
      const plansResponse = await fetch(`${baseUrl}/marketing-plans`, { headers })
      console.log('GET /marketing-plans:', plansResponse.status)
      const responseText = await plansResponse.text()
      console.log('Response:', responseText)
      
      if (!plansResponse.ok) {
        throw new Error(`Failed to get marketing plans: ${responseText}`)
      }
    } catch (error) {
      console.error('Error testing marketing plans:', error)
      throw error
    }
    
    const createPlanResponse = await fetch(`${baseUrl}/marketing-plans`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        businessName: 'Test Business',
        description: 'A comprehensive test business for API validation with detailed requirements',
        industry: 'Technology',
        targetAudience: 'Small and medium-sized businesses looking to improve their online presence',
        goals: 'Increase online presence and generate more qualified leads through digital channels',
        budget: '5000',
        challenges: 'Limited brand awareness in a competitive market with established players',
        marketingChannels: 'Social media, Content marketing, SEO, Email marketing',
        additionalNotes: 'Focus on B2B marketing with emphasis on thought leadership'
      })
    })
    console.log('POST /marketing-plans:', createPlanResponse.status)
    if (!createPlanResponse.ok) {
      const errorText = await createPlanResponse.text()
      console.error('Error response:', errorText)
      throw new Error(`Failed to create marketing plan: ${errorText}`)
    }

    // Test Subscriptions API
    console.log(chalk.yellow('\n💳 Testing Subscriptions API...'))
    
    const subscriptionResponse = await fetch(`${baseUrl}/subscriptions`, { headers })
    console.log('GET /subscriptions:', subscriptionResponse.status)
    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text()
      console.error('Error response:', errorText)
      throw new Error(`Failed to get subscriptions: ${errorText}`)
    }
    
    const createSubscriptionResponse = await fetch(`${baseUrl}/subscriptions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tier: 'growth-pro'
      })
    })
    console.log('POST /subscriptions:', createSubscriptionResponse.status)
    if (!createSubscriptionResponse.ok) {
      const errorText = await createSubscriptionResponse.text()
      console.error('Error response:', errorText)
      throw new Error(`Failed to create subscription: ${errorText}`)
    }

    // Test Experts API
    console.log(chalk.yellow('\n👥 Testing Experts API...'))
    
    const expertsResponse = await fetch(`${baseUrl}/experts`, { headers })
    console.log('GET /experts:', expertsResponse.status)
    if (!expertsResponse.ok) {
      const errorText = await expertsResponse.text()
      console.error('Error response:', errorText)
      throw new Error(`Failed to get experts: ${errorText}`)
    }

    // Test Messages API
    console.log(chalk.yellow('\n💬 Testing Messages API...'))
    
    const messagesResponse = await fetch(`${baseUrl}/messages`, { headers })
    console.log('GET /messages:', messagesResponse.status)
    if (!messagesResponse.ok) {
      const errorText = await messagesResponse.text()
      console.error('Error response:', errorText)
      throw new Error(`Failed to get messages: ${errorText}`)
    }
    
    const sendMessageResponse = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        expertId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'Test message for API validation'
      })
    })
    console.log('POST /messages:', sendMessageResponse.status)
    if (!sendMessageResponse.ok) {
      const errorText = await sendMessageResponse.text()
      console.error('Error response:', errorText)
      throw new Error(`Failed to send message: ${errorText}`)
    }

    // Cleanup
    console.log(chalk.yellow('\n🧹 Cleaning up...'))
    await deleteTestUser(testUser.id)
    console.log(chalk.green('✓ Test user deleted'))

    console.log(chalk.green('\n✨ All tests completed successfully!\n'))
  } catch (error) {
    console.error(chalk.red('\n❌ Test failed:'), error)
    process.exit(1)
  }
}

// Run the tests
console.log(chalk.blue('🔍 API Test Suite'))
testAPI() 