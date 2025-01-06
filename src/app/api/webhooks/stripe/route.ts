import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"
import Stripe from "stripe"
import crypto from "crypto"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Parse the signature header
    const parts = signature.split(',')
    const timestampPart = parts.find(part => part.startsWith('t='))
    const signaturePart = parts.find(part => part.startsWith('v1='))

    if (!timestampPart || !signaturePart) {
      throw new Error('Invalid signature format')
    }

    const timestamp = timestampPart.substring(2)
    const hash = signaturePart.substring(3)

    // Create the signed payload
    const signedPayload = `${timestamp}.${payload}`

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex')

    return hash === expectedSignature
  } catch (err) {
    console.error('Error verifying signature:', err)
    return false
  }
}

export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
    if (!WEBHOOK_SECRET) {
      throw new Error("Missing STRIPE_WEBHOOK_SECRET")
    }

    // Get the signature
    const headersList = headers()
    const signature = await headersList.get("stripe-signature")

    if (!signature) {
      return new NextResponse("No signature found", { status: 400 })
    }

    // Get the body
    const body = await req.text()

    // Verify signature
    if (!verifyStripeSignature(body, signature, WEBHOOK_SECRET)) {
      return new NextResponse("Invalid signature", { status: 401 })
    }

    const event = JSON.parse(body)
    const session = event.data.object

    if (event.type === "checkout.session.completed") {
      const { metadata } = session
      const userId = metadata?.userId

      if (!userId) {
        console.error("No user ID in metadata:", metadata)
        return new NextResponse("No user ID in metadata", { status: 400 })
      }

      // Get customer record
      const { data: customer, error: customerFetchError } = await supabaseAdmin
        .from("customers")
        .select()
        .eq("user_id", userId)
        .single()

      if (customerFetchError || !customer) {
        console.error("Error fetching customer:", customerFetchError)
        return new NextResponse("Error fetching customer", { status: 500 })
      }

      // Update customer record with Stripe customer ID
      const { error: customerError } = await supabaseAdmin
        .from("customers")
        .update({
          stripe_customer_id: session.customer
        })
        .eq("id", customer.id)

      if (customerError) {
        console.error("Error updating customer:", customerError)
        return new NextResponse("Error updating customer", { status: 500 })
      }

      // Get subscription record
      const { data: existingSubscription, error: subscriptionFetchError } = await supabaseAdmin
        .from("subscriptions")
        .select()
        .eq("user_id", userId)
        .single()

      if (subscriptionFetchError) {
        console.error("Error fetching subscription:", subscriptionFetchError)
        return new NextResponse("Error fetching subscription", { status: 500 })
      }

      // Create or update subscription
      const subscriptionData = {
        id: existingSubscription?.id || crypto.randomUUID(),
        user_id: userId,
        tier: metadata.tier,
        status: "active",
        stripe_subscription_id: session.subscription,
        plan_generations_left: metadata.tier === "growth-pro" ? 10 : 20,
        max_plan_generations: metadata.tier === "growth-pro" ? 10 : 20,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      if (existingSubscription) {
        // Update existing subscription
        const { error: subscriptionError } = await supabaseAdmin
          .from("subscriptions")
          .update(subscriptionData)
          .eq("id", existingSubscription.id)

        if (subscriptionError) {
          console.error("Error updating subscription:", subscriptionError)
          return new NextResponse("Error updating subscription", { status: 500 })
        }
      } else {
        // Create new subscription
        const { error: subscriptionError } = await supabaseAdmin
          .from("subscriptions")
          .insert(subscriptionData)

        if (subscriptionError) {
          console.error("Error creating subscription:", subscriptionError)
          return new NextResponse("Error creating subscription", { status: 500 })
        }
      }

      console.log("Successfully updated subscription:", subscriptionData)
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error("Stripe webhook error:", error)
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
} 