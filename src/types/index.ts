export type SubscriptionTier = 'free' | 'growth-pro' | 'growth-expert'

export type Subscription = {
  id: string
  userId: string
  tier: SubscriptionTier
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodEnd: Date
  planGenerationsLeft: number
  maxPlanGenerations: number
}

export type MarketingPlan = {
  id: string
  userId: string
  businessName: string
  industry: string
  createdAt: Date
  plan: string
}

export type Message = {
  id: string
  userId: string
  expertId: string
  content: string
  createdAt: Date
  read: boolean
}

export type Expert = {
  id: string
  name: string
  role: string
  avatar: string
  expertise: string[]
  available: boolean
} 