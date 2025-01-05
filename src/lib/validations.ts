import { z } from "zod"

// Marketing Plan Generation Schema
export const marketingPlanSchema = z.object({
  businessName: z.string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),
  industry: z.string()
    .min(2, "Industry must be at least 2 characters")
    .max(50, "Industry must be less than 50 characters"),
  targetAudience: z.string()
    .min(10, "Target audience description must be at least 10 characters")
    .max(500, "Target audience description must be less than 500 characters"),
  goals: z.array(z.string())
    .min(1, "At least one goal is required")
    .max(5, "Maximum 5 goals allowed"),
  budget: z.string()
    .regex(/^\$?\d+(?:,\d{3})*(?:\.\d{2})?$/, "Invalid budget format"),
  timeline: z.string()
    .min(2, "Timeline must be at least 2 characters")
    .max(50, "Timeline must be less than 50 characters"),
  competitors: z.array(z.string())
    .max(10, "Maximum 10 competitors allowed")
    .optional(),
  currentChannels: z.array(z.string())
    .max(10, "Maximum 10 channels allowed")
    .optional()
})

// Subscription Schema
export const subscriptionSchema = z.object({
  tier: z.enum(["growth-pro", "growth-expert"], {
    errorMap: () => ({ message: "Invalid subscription tier" })
  })
})

// Message Schema
export const messageSchema = z.object({
  expertId: z.string().uuid("Invalid expert ID"),
  content: z.string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be less than 2000 characters")
})

// Expert Profile Schema
export const expertProfileSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  title: z.string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),
  bio: z.string()
    .min(50, "Bio must be at least 50 characters")
    .max(500, "Bio must be less than 500 characters"),
  specialties: z.array(z.string())
    .min(1, "At least one specialty is required")
    .max(5, "Maximum 5 specialties allowed"),
  availability: z.enum(["full", "limited", "unavailable"]),
  hourlyRate: z.number()
    .min(50, "Minimum hourly rate is $50")
    .max(500, "Maximum hourly rate is $500")
})

// User Profile Schema
export const userProfileSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  company: z.string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters")
    .optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),
  timezone: z.string()
    .regex(/^[A-Za-z_]+\/[A-Za-z_]+$/, "Invalid timezone format")
    .optional(),
  marketingExperience: z.enum(["beginner", "intermediate", "advanced"])
    .optional(),
  preferences: z.object({
    emailNotifications: z.boolean(),
    marketingUpdates: z.boolean(),
    expertCommunication: z.boolean()
  }).optional()
})

// API Response Schemas
export const apiResponseSchema = z.object({
  data: z.unknown(),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid().optional()
})

export const apiErrorSchema = z.object({
  error: z.string(),
  timestamp: z.string().datetime(),
  requestId: z.string().uuid()
})

// Type exports
export type MarketingPlan = z.infer<typeof marketingPlanSchema>
export type Subscription = z.infer<typeof subscriptionSchema>
export type Message = z.infer<typeof messageSchema>
export type ExpertProfile = z.infer<typeof expertProfileSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type ApiResponse = z.infer<typeof apiResponseSchema>
export type ApiError = z.infer<typeof apiErrorSchema> 