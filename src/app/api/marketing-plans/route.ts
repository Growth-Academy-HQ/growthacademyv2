import { withApiMiddleware, validateRequest, successResponse, errorResponse } from "@/lib/api-middleware"
import { marketingPlanSchema } from "@/lib/validations"
import { supabase } from "@/lib/supabase"

export const GET = withApiMiddleware(async (req: Request, userId: string) => {
  const { data: plans } = await supabase
    .from("marketing_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return successResponse(plans)
})

export const POST = withApiMiddleware(async (req: Request, userId: string) => {
  try {
    // Parse and validate request body
    const body = await req.json()
    console.log("Request body:", body)

    const validatedData = await validateRequest(marketingPlanSchema)(req)
    console.log("Validated data:", validatedData)

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

    // Store the plan
    const { data: plan, error: insertError } = await supabase
      .from("marketing_plans")
      .insert({
        user_id: userId,
        business_name: validatedData.businessName,
        industry: validatedData.industry,
        plan: validatedData.plan,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Failed to save plan:", insertError)
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
      console.error("Failed to update subscription:", updateError)
      return errorResponse("Failed to update plan generation count", 500)
    }

    // Log the action
    await supabase
      .from("audit_logs")
      .insert({
        user_id: userId,
        action: "generate_marketing_plan",
        details: {
          plan_id: plan.id,
          business_name: validatedData.businessName,
          industry: validatedData.industry,
        },
      })

    return successResponse(plan)
  } catch (error) {
    console.error("Error in POST /api/marketing-plans:", error)
    return errorResponse("Internal server error", 500)
  }
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
    console.error("Failed to delete plan:", deleteError)
    return errorResponse("Failed to delete marketing plan", 500)
  }

  // Log the action
  await supabase
    .from("audit_logs")
    .insert({
      user_id: userId,
      action: "delete_marketing_plan",
      details: {
        plan_id: planId,
      },
    })

  return successResponse(null, 204)
}) 