'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { fadeIn } from '@/lib/animations'

const industries = [
  "E-commerce",
  "SaaS",
  "Healthcare",
  "Education",
  "Finance",
  "Real Estate",
  "Technology",
  "Retail",
  "Manufacturing",
  "Other"
]

const marketingChannels = [
  "Social Media",
  "Email Marketing",
  "Content Marketing",
  "SEO",
  "PPC Advertising",
  "Influencer Marketing",
  "PR",
  "Events",
  "Direct Mail",
  "Other"
]

const formSchema = z.object({
  businessName: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  industry: z.string().min(2, {
    message: "Please select an industry.",
  }),
  targetAudience: z.string().min(10, {
    message: "Target audience must be at least 10 characters.",
  }),
  goals: z.string().min(10, {
    message: "Goals must be at least 10 characters.",
  }),
  budget: z.string().optional(),
  challenges: z.string().min(10, {
    message: "Challenges must be at least 10 characters.",
  }),
  marketingChannels: z.array(z.string()).min(1, {
    message: "Please select at least one marketing channel.",
  }),
  additionalNotes: z.string().optional(),
})

export default function GrowthAIForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null)
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      description: "",
      industry: "",
      targetAudience: "",
      goals: "",
      budget: "",
      challenges: "",
      marketingChannels: [],
      additionalNotes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true)
    setGeneratedPlan(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          date: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate plan")
      }

      const data = await response.json()
      setGeneratedPlan(data.plan)

      // Save to dashboard
      await fetch("/api/save-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: data.plan,
          businessName: values.businessName,
          industry: values.industry,
          date: new Date().toISOString(),
        }),
      })

      toast({
        title: "Success!",
        description: "Your marketing plan has been generated and saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate marketing plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <motion.form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="card space-y-8"
        variants={fadeIn}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-200 mb-2">
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              {...form.register("businessName")}
              className="input w-full"
              placeholder="Enter your business name"
            />
            {form.formState.errors.businessName && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.businessName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-200 mb-2">
              Industry
            </label>
            <select
              id="industry"
              {...form.register("industry")}
              className="input w-full"
            >
              <option value="">Select an industry</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            {form.formState.errors.industry && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.industry.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
              Business Description
            </label>
            <textarea
              id="description"
              {...form.register("description")}
              rows={3}
              className="input w-full"
              placeholder="Describe your business and what makes it unique"
            />
            {form.formState.errors.description && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-200 mb-2">
              Target Audience
            </label>
            <textarea
              id="targetAudience"
              {...form.register("targetAudience")}
              rows={3}
              className="input w-full"
              placeholder="Describe your ideal customer profile"
            />
            {form.formState.errors.targetAudience && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.targetAudience.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="goals" className="block text-sm font-medium text-gray-200 mb-2">
              Marketing Goals
            </label>
            <textarea
              id="goals"
              {...form.register("goals")}
              rows={3}
              className="input w-full"
              placeholder="What are your main marketing objectives?"
            />
            {form.formState.errors.goals && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.goals.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-200 mb-2">
              Budget Range (Optional)
            </label>
            <select
              id="budget"
              {...form.register("budget")}
              className="input w-full"
            >
              <option value="">Select a budget range</option>
              <option value="$1,000 - $5,000">$1,000 - $5,000</option>
              <option value="$5,000 - $10,000">$5,000 - $10,000</option>
              <option value="$10,000 - $25,000">$10,000 - $25,000</option>
              <option value="$25,000+">$25,000+</option>
            </select>
          </div>

          <div>
            <label htmlFor="marketingChannels" className="block text-sm font-medium text-gray-200 mb-2">
              Preferred Marketing Channels
            </label>
            <div className="grid grid-cols-2 gap-2 p-3 input">
              {marketingChannels.map((channel) => (
                <label key={channel} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={channel}
                    {...form.register("marketingChannels")}
                    className="rounded border-white/10 bg-white/5 text-white focus:ring-white/50"
                  />
                  <span className="text-sm text-gray-200">{channel}</span>
                </label>
              ))}
            </div>
            {form.formState.errors.marketingChannels && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.marketingChannels.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="challenges" className="block text-sm font-medium text-gray-200 mb-2">
              Current Challenges
            </label>
            <textarea
              id="challenges"
              {...form.register("challenges")}
              rows={3}
              className="input w-full"
              placeholder="What marketing challenges are you currently facing?"
            />
            {form.formState.errors.challenges && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.challenges.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-200 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="additionalNotes"
              {...form.register("additionalNotes")}
              rows={3}
              className="input w-full"
              placeholder="Any other information you'd like to share?"
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating Plan..." : "Generate Marketing Plan"}
          </button>
        </div>
      </motion.form>

      {generatedPlan && (
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card">
            <h2 className="mb-6 text-2xl font-bold text-white">Your Marketing Plan</h2>
            <div className="prose prose-sm max-w-none text-gray-300">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {generatedPlan.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => {
                  const blob = new Blob([generatedPlan], { type: "text/plain" })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = "marketing-plan.txt"
                  a.click()
                }}
                className="btn btn-secondary"
              >
                Download Plan
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="btn btn-secondary"
              >
                View in Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
} 