import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY")
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

const TIER_LIMITS = {
  "growth-pro": 10,
  "growth-expert": 20,
} as const

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature")

  if (!signature) {
    return new NextResponse("No signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error("[WEBHOOK_ERROR]", error)
    return new NextResponse(
      `Webhook Error: ${error instanceof Error ? error.message : "Unknown Error"}`,
      { status: 400 }
    )
  }

  const session = event.data.object as Stripe.Checkout.Session | Stripe.Subscription

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        if (!("metadata" in session)) {
          throw new Error("No metadata in session")
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        const tier = session.metadata?.tier
        if (!tier || !(tier in TIER_LIMITS)) {
          throw new Error("Invalid tier in metadata")
        }

        await supabase
          .from("subscriptions")
          .upsert({
            user_id: session.metadata?.userId,
            tier: tier,
            status: "active",
            stripe_subscription_id: subscription.id,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            plan_generations_left: TIER_LIMITS[tier as keyof typeof TIER_LIMITS],
            max_plan_generations: TIER_LIMITS[tier as keyof typeof TIER_LIMITS],
          })
          .eq("user_id", session.metadata?.userId)
        break
      }

      case "invoice.payment_succeeded": {
        if (!("subscription" in session)) {
          throw new Error("No subscription in session")
        }

        const paidSubscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        const { data: existingSubscription } = await supabase
          .from("subscriptions")
          .select("tier")
          .eq("stripe_subscription_id", paidSubscription.id)
          .single()

        if (!existingSubscription?.tier || !(existingSubscription.tier in TIER_LIMITS)) {
          throw new Error("Invalid tier in subscription")
        }

        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_end: new Date(paidSubscription.current_period_end * 1000).toISOString(),
            plan_generations_left: TIER_LIMITS[existingSubscription.tier as keyof typeof TIER_LIMITS],
          })
          .eq("stripe_subscription_id", paidSubscription.id)
        break
      }

      case "invoice.payment_failed": {
        if (!("subscription" in session)) {
          throw new Error("No subscription in session")
        }

        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
          })
          .eq("stripe_subscription_id", session.subscription)
        break
      }

      case "customer.subscription.deleted": {
        if (!("id" in session)) {
          throw new Error("No id in session")
        }

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            tier: "free",
            plan_generations_left: 1,
            max_plan_generations: 1,
            stripe_subscription_id: null,
          })
          .eq("stripe_subscription_id", session.id)
        break
      }
    }
  } catch (error) {
    console.error("[WEBHOOK_ERROR]", error)
    return new NextResponse(
      `Webhook Error: ${error instanceof Error ? error.message : "Unknown Error"}`,
      { status: 400 }
    )
  }

  return new NextResponse(null, { status: 200 })
} 