import { withApiMiddleware, validateRequest, successResponse, errorResponse } from "@/lib/api-middleware"
import { messageSchema } from "@/lib/validations"
import { createAuditLog } from "@/lib/security"
import { sanitizeInput } from "@/lib/security"
import { supabase } from "@/lib/supabase"

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
  const expertId = searchParams.get("expertId")

  const query = supabase
    .from("messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (expertId) {
    query.eq("expert_id", expertId)
  }

  const { data: messages, error } = await query

  if (error) {
    return errorResponse("Failed to fetch messages", 500)
  }

  return successResponse(messages)
})

export const POST = withApiMiddleware(async (req: Request, userId: string) => {
  // Check if user has expert tier
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .single()

  if (!subscription || subscription.tier !== "growth-expert") {
    return errorResponse("Expert tier required", 403)
  }

  // Validate request body
  const validatedData = await validateRequest(messageSchema)(req)

  // Sanitize message content
  const sanitizedContent = sanitizeInput(validatedData.content)

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      user_id: userId,
      expert_id: validatedData.expertId,
      content: sanitizedContent,
      read: false,
    })
    .select()
    .single()

  if (error) {
    return errorResponse("Failed to send message", 500)
  }

  await createAuditLog(userId, "send_message", {
    expert_id: validatedData.expertId,
    ip_address: req.headers.get("x-forwarded-for"),
    user_agent: req.headers.get("user-agent"),
  })

  return successResponse(message)
})

export const PATCH = withApiMiddleware(async (req: Request, userId: string) => {
  const { searchParams } = new URL(req.url)
  const messageId = searchParams.get("id")

  if (!messageId) {
    return errorResponse("Message ID required", 400)
  }

  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("id", messageId)
    .eq("user_id", userId)

  if (error) {
    return errorResponse("Failed to update message", 500)
  }

  return successResponse(null, 204)
}) 