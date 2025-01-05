import { withApiMiddleware, validateRequest, successResponse, errorResponse } from "@/lib/api-middleware"
import { subscriptionSchema } from "@/lib/validations"
import { createAuditLog } from "@/lib/security"
import { supabase } from "@/lib/supabase"
import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
})

const TIER_PRICES = {
  "growth-pro": process.env.STRIPE_GROWTH_PRO_PRICE_ID,
  "growth-expert": process.env.STRIPE_GROWTH_EXPERT_PRICE_ID,
} as const

const TIER_LIMITS = {
  free: 1,
  "growth-pro": 10,
  "growth-expert": 20,
} as const

export const GET = withApiMiddleware(async (req: Request, userId: string) => {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (!subscription) {
    // Create free tier subscription for new users
    const { data: newSubscription, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        tier: "free",
        status: "active",
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        plan_generations_left: TIER_LIMITS.free,
        max_plan_generations: TIER_LIMITS.free,
      })
      .select()
      .single()

    if (error) {
      return errorResponse("Failed to create subscription", 500)
    }

    await createAuditLog(userId, "subscribe", {
      tier: "free",
      status: "active",
      ip_address: req.headers.get("x-forwarded-for"),
      user_agent: req.headers.get("user-agent"),
    })

    return successResponse(newSubscription)
  }

  return successResponse(subscription)
})

export const POST = withApiMiddleware(async (req: Request, userId: string) => {
  // Validate request body
  const validatedData = await validateRequest(subscriptionSchema)(req)
  const priceId = TIER_PRICES[validatedData.tier]
  
  if (!priceId) {
    return errorResponse("Invalid tier", 400)
  }

  // Get or create customer
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single()

  let stripeCustomerId = existingCustomer?.stripe_customer_id

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      metadata: {
        userId,
      },
    })
    stripeCustomerId = customer.id

    await supabase
      .from("customers")
      .insert({
        user_id: userId,
        stripe_customer_id: customer.id,
      })
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    metadata: {
      userId,
      tier: validatedData.tier,
    },
  })

  if (!session.url) {
    return errorResponse("Failed to create checkout session", 500)
  }

  await createAuditLog(userId, "subscribe", {
    tier: validatedData.tier,
    status: "pending",
    ip_address: req.headers.get("x-forwarded-for"),
    user_agent: req.headers.get("user-agent"),
  })

  return successResponse({ url: session.url })
})

export const DELETE = withApiMiddleware(async (req: Request, userId: string) => {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", userId)
    .single()

  if (subscription?.stripe_subscription_id) {
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      tier: "free",
      plan_generations_left: TIER_LIMITS.free,
      max_plan_generations: TIER_LIMITS.free,
      stripe_subscription_id: null,
    })
    .eq("user_id", userId)

  if (error) {
    return errorResponse("Failed to cancel subscription", 500)
  }

  await createAuditLog(userId, "unsubscribe", {
    ip_address: req.headers.get("x-forwarded-for"),
    user_agent: req.headers.get("user-agent"),
  })

  return successResponse(null, 204)
}) 