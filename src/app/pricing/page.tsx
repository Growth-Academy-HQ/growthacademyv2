'use client'

import Navigation  from "@/components/Navigation"
import { SignUp, useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { fadeIn, staggerContainer, scaleUp } from '@/lib/animations'
import { useState } from "react"

export default function PricingPage() {
  const [showSignUp, setShowSignUp] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  const { isSignedIn } = useUser()

  const handleGetStarted = (planId: string) => {
    if (isSignedIn) {
      window.location.href = '/growth-ai'
    } else {
      setSelectedPlan(planId)
      setShowSignUp(true)
    }
  }

  if (showSignUp) {
    return (
      <>
        <Navigation />
        <div className="flex min-h-screen items-center justify-center bg-black pt-20">
          <div className="w-full max-w-md">
            <SignUp 
              path={selectedPlan}
              routing="path"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-white",
                  headerTitle: "text-gray-900",
                  headerSubtitle: "text-gray-600",
                  socialButtonsBlockButton: "text-gray-900 border border-gray-300 hover:bg-gray-50",
                  socialButtonsBlockButtonText: "text-gray-900",
                  dividerLine: "bg-gray-200",
                  formButtonPrimary: "bg-black hover:bg-black/80 text-white",
                  formFieldInput: "bg-white border-gray-200",
                  formFieldInputText: "text-black",
                  formFieldLabel: "text-gray-700",
                  footerActionText: "text-gray-900",
                  footerActionLink: "text-blue-600 hover:text-blue-800",
                  identityPreviewText: "text-black",
                  formFieldSuccessText: "text-black"
                },
                variables: {
                  colorText: "#000000",
                  colorTextSecondary: "#374151",
                  colorBackground: "#FFFFFF",
                  colorInputText: "#000000",
                  colorInputBackground: "#FFFFFF"
                }
              }}
            />
          </div>
        </div>
      </>
    )
  }

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
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-black to-black" />
          
          <div className="relative py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <motion.div 
                className="mx-auto max-w-4xl text-center"
                variants={fadeIn}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-gray-200">
                    Flexible Plans
                  </span>
                </motion.div>
                <h1 className="text-5xl font-bold tracking-tight sm:text-7xl gradient-text mb-8">
                  Simple pricing for your business
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-300 max-w-3xl mx-auto">
                  Choose the perfect plan to accelerate your growth with AI-powered marketing strategies and expert support.
                </p>
              </motion.div>

              <motion.div 
                className="mx-auto mt-20 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"
                variants={staggerContainer}
              >
                {tiers.map((tier, index) => (
                  <motion.div
                    key={tier.id}
                    className={`card group ${
                      tier.featured ? 'border-white/30' : ''
                    }`}
                    variants={scaleUp}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white">
                          {tier.name}
                        </h3>
                        {tier.featured && (
                          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-200">
                            Most Popular
                          </span>
                        )}
                      </div>
                      <p className="mt-4 text-sm text-gray-400">
                        {tier.description}
                      </p>
                      <div className="mt-6 flex items-baseline gap-x-1">
                        <span className="text-4xl font-bold text-white">${tier.price}</span>
                        <span className="text-sm font-semibold text-gray-400">/month</span>
                      </div>
                      <button 
                        onClick={() => handleGetStarted(tier.id)}
                        className={`mt-8 w-full btn ${tier.featured ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {tier.cta}
                      </button>
                      <ul className="mt-8 space-y-4">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-3 text-gray-300">
                            <svg
                              className="h-5 w-5 flex-none text-gray-300"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* FAQ Section */}
              <motion.div 
                className="mx-auto mt-24 max-w-3xl text-center"
                variants={fadeIn}
              >
                <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-300 mb-12">
                  Have questions? We're here to help.
                </p>
                <div className="grid gap-8">
                  {faqs.map((faq, index) => (
                    <motion.div 
                      key={faq.question}
                      className="card text-left"
                      variants={fadeIn}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                      <p className="text-gray-300">{faq.answer}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  )
}

const tiers = [
  {
    id: 'free',
    name: 'Growth Starter',
    description: 'Perfect for trying out our AI marketing tools.',
    price: '0',
    featured: false,
    href: '/signup',
    cta: 'Start for free',
    features: [
      '1 AI Marketing Plan Generation per month',
      'Monthly Newsletter access',
      'Email Support'
    ],
  },
  {
    id: 'growth-pro',
    name: 'Growth Pro',
    description: 'Ideal for growing businesses.',
    price: '29.99',
    featured: true,
    href: '/signup?plan=pro',
    cta: 'Get started',
    features: [
      '10 AI Marketing Plan generations per month',
      '30-min monthly consultation with marketing expert',
      'Premium resources (E-books, templates)',
      'Newsletter access',
      'Priority Email Support'
    ],
  },
  {
    id: 'expert',
    name: 'Growth Expert',
    description: 'For businesses needing comprehensive support.',
    price: '49.99',
    featured: false,
    href: '/signup?plan=expert',
    cta: 'Get started',
    features: [
      '20 AI Marketing Plan generations per month',
      '1-hour monthly VIP strategy workshop',
      'VIP Support (Email, Direct Messaging)',
      'All Pro features included',
      'Expert-only resources and benefits'
    ],
  },
]

const faqs = [
  {
    question: "How does the AI marketing plan generation work?",
    answer: "Our AI analyzes your business details, goals, and industry data to create customized marketing strategies using proven frameworks and best practices."
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Yes, you can change your plan at any time. Changes will be reflected in your next billing cycle."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day money-back guarantee if you're not satisfied with our service."
  },
  {
    question: "What kind of support do you provide?",
    answer: "We offer email support for all plans, with priority support and consultation calls available in higher tiers."
  }
] 