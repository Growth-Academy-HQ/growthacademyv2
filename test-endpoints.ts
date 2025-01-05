import { SignJWT } from 'jose'
import crypto from 'crypto'

async function getTestToken() {
  // This is a mock token for testing - in production, use Clerk's authentication
  const secret = crypto.randomBytes(32)
  const token = await new SignJWT({ userId: 'test-user' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret)
  
  return token
}

async function testEndpoints() {
  const token = await getTestToken()
  const baseUrl = 'http://localhost:3001/api'
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  try {
    // Test Marketing Plans API
    console.log('\nTesting Marketing Plans API...')
    
    const plansResponse = await fetch(`${baseUrl}/marketing-plans`, {
      headers
    })
    console.log('GET /marketing-plans:', plansResponse.status)
    console.log(await plansResponse.json())

    const createPlanResponse = await fetch(`${baseUrl}/marketing-plans`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        businessName: 'Test Business',
        description: 'A test business for API validation',
        industry: 'Technology',
        targetAudience: 'Small businesses and startups',
        goals: 'Increase online presence and lead generation',
        budget: '5000',
        challenges: 'Limited brand awareness and high competition',
        marketingChannels: 'Social media, Content marketing, SEO',
        additionalNotes: 'Focus on B2B marketing'
      })
    })
    console.log('POST /marketing-plans:', createPlanResponse.status)
    console.log(await createPlanResponse.json())

    // Test Subscriptions API
    console.log('\nTesting Subscriptions API...')
    
    const subscriptionResponse = await fetch(`${baseUrl}/subscriptions`, {
      headers
    })
    console.log('GET /subscriptions:', subscriptionResponse.status)
    console.log(await subscriptionResponse.json())

    const createSubscriptionResponse = await fetch(`${baseUrl}/subscriptions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tier: 'growth-pro'
      })
    })
    console.log('POST /subscriptions:', createSubscriptionResponse.status)
    console.log(await createSubscriptionResponse.json())

    // Test Experts API
    console.log('\nTesting Experts API...')
    
    const expertsResponse = await fetch(`${baseUrl}/experts`, {
      headers
    })
    console.log('GET /experts:', expertsResponse.status)
    console.log(await expertsResponse.json())

    // Test Messages API
    console.log('\nTesting Messages API...')
    
    const messagesResponse = await fetch(`${baseUrl}/messages`, {
      headers
    })
    console.log('GET /messages:', messagesResponse.status)
    console.log(await messagesResponse.json())

    const sendMessageResponse = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        expertId: '123e4567-e89b-12d3-a456-426614174000', // Example UUID
        content: 'Test message'
      })
    })
    console.log('POST /messages:', sendMessageResponse.status)
    console.log(await sendMessageResponse.json())

  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the tests
testEndpoints() 