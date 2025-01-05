import { withApiMiddleware, validateRequest, successResponse, errorResponse } from "@/lib/api-middleware"
import { createAuditLog } from "@/lib/security"
import { supabase } from "@/lib/supabase"
import { z } from "zod"

// Expert validation schema
const expertSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  avatar: z.string().url("Invalid avatar URL"),
  expertise: z.array(z.string()).min(1, "At least one expertise required"),
  available: z.boolean().optional(),
})

export const GET = withApiMiddleware(async (req: Request, userId: string) => {
  // Check if user has expert tier
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .single()

  if (!subscription || subscription.tier !== "growth-expert") {
    return errorResponse("Expert tier required", 403)
  }

  const { searchParams } = new URL(req.url)
  const expertId = searchParams.get("id")

  if (expertId) {
    const { data: expert, error } = await supabase
      .from("experts")
      .select("*")
      .eq("id", expertId)
      .single()

    if (error) {
      return errorResponse("Failed to fetch expert", 500)
    }

    return successResponse(expert)
  }

  const { data: experts, error } = await supabase
    .from("experts")
    .select("*")
    .eq("available", true)
    .order("name")

  if (error) {
    return errorResponse("Failed to fetch experts", 500)
  }

  return successResponse(experts)
})

// Admin-only routes below
export const POST = withApiMiddleware(async (req: Request, userId: string) => {
  // TODO: Add admin check
  // For now, we'll just block this endpoint
  return errorResponse("Unauthorized", 401)

  // Validate request body
  const validatedData = await validateRequest(expertSchema)(req)

  const { data: expert, error } = await supabase
    .from("experts")
    .insert({
      name: validatedData.name,
      role: validatedData.role,
      avatar: validatedData.avatar,
      expertise: validatedData.expertise,
      available: validatedData.available ?? true,
    })
    .select()
    .single()

  if (error) {
    return errorResponse("Failed to create expert", 500)
  }

  await createAuditLog(userId, "create_expert", {
    expert_id: expert.id,
    ip_address: req.headers.get("x-forwarded-for"),
    user_agent: req.headers.get("user-agent"),
  })

  return successResponse(expert)
})

export const PATCH = withApiMiddleware(async (req: Request, userId: string) => {
  // TODO: Add admin check
  // For now, we'll just block this endpoint
  return errorResponse("Unauthorized", 401)

  const { searchParams } = new URL(req.url)
  const expertId = searchParams.get("id")

  if (!expertId) {
    return errorResponse("Expert ID required", 400)
  }

  const { available } = await req.json()

  const { data: expert, error } = await supabase
    .from("experts")
    .update({ available })
    .eq("id", expertId)
    .select()
    .single()

  if (error) {
    return errorResponse("Failed to update expert", 500)
  }

  await createAuditLog(userId, "update_expert", {
    expert_id: expertId,
    changes: { available },
    ip_address: req.headers.get("x-forwarded-for"),
    user_agent: req.headers.get("user-agent"),
  })

  return successResponse(expert)
}) 