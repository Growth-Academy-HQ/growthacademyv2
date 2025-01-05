import { withApiMiddleware, validateRequest, successResponse, errorResponse } from "@/lib/api-middleware"
import { marketingPlanSchema } from "@/lib/validations"
import { supabase } from "@/lib/supabase"
import Anthropic from "@anthropic-ai/sdk"

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("Missing ANTHROPIC_API_KEY")
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const GET = withApiMiddleware(async (req: Request, userId: string) => {
  const { data: plans } = await supabase
    .from("marketing_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return successResponse(plans)
})

export const POST = withApiMiddleware(async (req: Request, userId: string) => {
  // Validate request body
  const validatedData = await validateRequest(marketingPlanSchema)(req)

  // Check subscription and plan generation limits
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (!subscription) {
    return errorResponse("No active subscription", 400)
  }

  if (subscription.plan_generations_left <= 0) {
    return errorResponse("Plan generation limit reached", 400)
  }

  const prompt = `Generate a comprehensive marketing plan for the following business:

Business Name: ${validatedData.businessName}
Industry: ${validatedData.industry}
Target Audience: ${validatedData.targetAudience}
Goals: ${validatedData.goals.join(", ")}
Budget: ${validatedData.budget}
Timeline: ${validatedData.timeline}
Competitors: ${validatedData.competitors?.join(", ") || "None"}
Current Marketing Channels: ${validatedData.currentChannels?.join(", ") || "None"}

Please provide a detailed marketing plan that includes:
1. Executive Summary
2. Target Market Analysis
3. Marketing Strategy
4. Channel-specific Tactics
5. Budget Allocation
6. Timeline and Milestones
7. Key Performance Indicators (KPIs)
8. Risk Analysis and Mitigation
9. Implementation Plan

Format the response in a clear, professional manner with sections and bullet points where appropriate.`

  const completion = await anthropic.messages.create({
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
    model: "claude-3-opus-20240229",
  })

  const content = completion.content[0].type === 'text' 
    ? completion.content[0].text 
    : ''

  if (!content) {
    return errorResponse("Failed to generate marketing plan", 500)
  }

  // Store the generated plan
  const { data: plan, error: insertError } = await supabase
    .from("marketing_plans")
    .insert({
      user_id: userId,
      business_name: validatedData.businessName,
      industry: validatedData.industry,
      plan: content,
    })
    .select()
    .single()

  if (insertError) {
    return errorResponse("Failed to save marketing plan", 500)
  }

  // Update plan generation count
  const { error: updateError } = await supabase
    .from("subscriptions")
    .update({
      plan_generations_left: subscription.plan_generations_left - 1,
    })
    .eq("user_id", userId)

  if (updateError) {
    return errorResponse("Failed to update plan generation count", 500)
  }

  return successResponse(plan)
})

export const DELETE = withApiMiddleware(async (req: Request, userId: string) => {
  const { searchParams } = new URL(req.url)
  const planId = searchParams.get("id")

  if (!planId) {
    return errorResponse("Plan ID required", 400)
  }

  const { error: deleteError } = await supabase
    .from("marketing_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", userId)

  if (deleteError) {
    return errorResponse("Failed to delete marketing plan", 500)
  }

  return successResponse(null, 204)
}) 