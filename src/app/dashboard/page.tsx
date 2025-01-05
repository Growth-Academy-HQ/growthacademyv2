'use client'

import Navigation from "@/components/Navigation"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from '@/lib/animations'
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface MarketingPlan {
  id: string
  business_name: string
  industry: string
  plan: string
  created_at: string
}

interface UserSubscription {
  tier: string
  status: string
  current_period_end: string
  plan_generations_left: number
  max_plan_generations: number
  stripe_subscription_id: string | null
}

export default function DashboardPage() {
  const { user } = useUser()
  const [plans, setPlans] = useState<MarketingPlan[]>([])
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user) {
      // Fetch user's marketing plans
      const fetchPlans = async () => {
        const { data, error } = await supabase
          .from('marketing_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (data && !error) {
          setPlans(data)
        }
      }

      // Fetch user's subscription
      const fetchSubscription = async () => {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data && !error) {
          setSubscription(data)
        }
      }

      fetchPlans()
      fetchSubscription()
    }
  }, [user, supabase])

  return (
    <>
      <Navigation />
      <main className="bg-black text-white">
        <motion.div 
          className="relative min-h-screen pt-20"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-black to-black" />
          
          <div className="relative py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <motion.div 
                className="mb-16"
                variants={fadeIn}
              >
                <h1 className="text-4xl font-bold text-white mb-2">Welcome, {user?.firstName || 'User'}</h1>
                <p className="text-gray-400">{user?.emailAddresses[0].emailAddress}</p>
                
                {subscription && (
                  <div className="mt-6 card inline-block">
                    <h2 className="text-lg font-semibold text-white mb-2">
                      Current Plan: {subscription.tier === 'free' ? 'Free' : 
                        subscription.tier === 'growth-pro' ? 'Growth Pro' : 'Growth Expert'}
                    </h2>
                    <p className="text-gray-400">
                      Status: <span className="text-green-400">{subscription.status}</span>
                    </p>
                    <p className="text-gray-400">
                      Plan Generations: {subscription.plan_generations_left} / {subscription.max_plan_generations}
                    </p>
                    <p className="text-gray-400">
                      Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </motion.div>

              <motion.div variants={fadeIn}>
                <h2 className="text-2xl font-bold text-white mb-8">Your Marketing Plans</h2>
                
                {plans.length === 0 ? (
                  <div className="card text-center">
                    <p className="text-gray-400 mb-6">You haven't generated any marketing plans yet.</p>
                    <a href="/growth-ai" className="btn btn-primary">
                      Generate Your First Plan
                    </a>
                  </div>
                ) : (
                  <div className="grid gap-8 md:grid-cols-2">
                    {plans.map((plan) => (
                      <motion.div 
                        key={plan.id}
                        className="card"
                        variants={fadeIn}
                      >
                        <h3 className="text-xl font-semibold text-white mb-4">
                          {plan.business_name}
                        </h3>
                        <p className="text-gray-400 mb-4 text-sm">
                          Generated on {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                        <div className="max-h-48 overflow-y-auto mb-6 text-gray-300">
                          <div className="whitespace-pre-wrap text-sm">
                            {plan.plan}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const blob = new Blob([plan.plan], { type: "text/plain" })
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement("a")
                            a.href = url
                            a.download = `${plan.business_name}-marketing-plan.txt`
                            a.click()
                          }}
                          className="btn btn-secondary"
                        >
                          Download Plan
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  )
} 