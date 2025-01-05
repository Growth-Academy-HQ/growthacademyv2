'use client'

import { SignIn, useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/animations"
import GrowthAIForm from "./form"
import  Navigation  from "@/components/Navigation"
import Image from "next/image"

export default function GrowthAIPage() {
  const { isSignedIn } = useUser()

  return (
    <>
      <Navigation />
      <main className="bg-black text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="pt-32 pb-16 text-center"
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            <div className="flex justify-center mb-6">
              <Image
                src="/assets/logos/growth-ai-logo.svg"
                alt="Growth AI"
                width={200}
                height={200}
                className="filter invert"
                style={{ opacity: 1 }}
              />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white">Growth AI Marketing Plan Generator</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Fill out the form below to generate a personalized marketing plan for your business
            </p>
          </motion.div>

          <div className="mx-auto max-w-4xl pb-16">
            {!isSignedIn ? (
              <div className="card text-center">
                <h2 className="text-2xl font-bold text-white mb-6">Sign in to Continue</h2>
                <p className="text-gray-300 mb-8">
                  Please sign in to generate your personalized marketing plan.
                </p>
                <div className="flex justify-center">
                  <SignIn 
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "bg-white/5 border border-white/10",
                        headerTitle: "text-white",
                        headerSubtitle: "text-gray-300",
                        socialButtonsBlockButton: "bg-white/10 border border-white/20 text-white hover:bg-white/20",
                        dividerLine: "bg-white/10",
                        formButtonPrimary: "bg-gradient-to-r from-white to-gray-200 text-black",
                        formFieldInput: "bg-white/5 border-white/10 text-white",
                        formFieldLabel: "text-gray-300",
                        footer: "hidden"
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <GrowthAIForm />
            )}
          </div>
        </div>
      </main>
    </>
  )
} 