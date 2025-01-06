import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { WebhookEvent } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase"
import { createAuditLog } from "@/lib/security"
import crypto from 'crypto'

function verifyWebhookSignature(
  payload: string,
  timestamp: string,
  signature: string,
  secret: string
): boolean {
  try {
    const timestampNum = parseInt(timestamp, 10)
    const age = Math.floor(Date.now() / 1000) - timestampNum

    // Verify timestamp is not too old (5 minutes)
    if (age > 300) {
      throw new Error('Webhook timestamp too old')
    }

    // Split signature header
    const [version, hash] = signature.split(',')
    if (version !== 'v1' || !hash) {
      throw new Error('Invalid signature format')
    }

    // Create HMAC
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(`${timestamp}.${payload}`)
    const expectedSignature = hmac.digest('hex')

    return expectedSignature === hash
  } catch (err) {
    console.error('Error verifying signature:', err)
    return false
  }
}

export async function POST(req: Request) {
  try {
    // Verify webhook secret
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
    if (!WEBHOOK_SECRET) {
      console.error("Missing CLERK_WEBHOOK_SECRET")
      return new NextResponse("Missing webhook secret", {
        status: 500,
      })
    }

    // Get the headers
    const headersList = headers()
    const svix_id = await headersList.get("svix-id")
    const svix_timestamp = await headersList.get("svix-timestamp")
    const svix_signature = await headersList.get("svix-signature")

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing svix headers:", { svix_id, svix_timestamp, svix_signature })
      return new NextResponse("Error occurred - no svix headers", {
        status: 400,
      })
    }

    // Get the body as text
    const body = await req.text()
    console.log("Received webhook body:", body)

    // Verify signature
    if (!verifyWebhookSignature(body, svix_timestamp, svix_signature, WEBHOOK_SECRET)) {
      console.error("Invalid webhook signature")
      return new NextResponse("Invalid signature", {
        status: 401,
      })
    }

    // Parse the verified body
    const payload = JSON.parse(body)
    const evt = payload as WebhookEvent

    const eventType = evt.type
    console.log(`Webhook received: ${eventType}`)

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data
      console.log(`Processing user creation for: ${id}`)

      // Create customer record first
      const { data: existingCustomer } = await supabaseAdmin
        .from("customers")
        .select()
        .eq("user_id", id)
        .single()

      if (existingCustomer) {
        console.log("Customer already exists:", existingCustomer)
      } else {
        const { error: customerError } = await supabaseAdmin
          .from("customers")
          .insert({
            id: crypto.randomUUID(),
            user_id: id,
            stripe_customer_id: 'temp_' + crypto.randomUUID() // Temporary ID until Stripe updates it
          })

        if (customerError) {
          console.error("Error creating customer:", customerError)
          return new NextResponse("Error creating customer", {
            status: 500,
          })
        }
      }

      // Create a free subscription for the new user
      const { data: existingSubscription } = await supabaseAdmin
        .from("subscriptions")
        .select()
        .eq("user_id", id)
        .single()

      if (existingSubscription) {
        console.log("Subscription already exists:", existingSubscription)
      } else {
        const { data: subscription, error: subscriptionError } = await supabaseAdmin
          .from("subscriptions")
          .insert({
            id: crypto.randomUUID(),
            user_id: id,
            tier: "free",
            status: "active",
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            plan_generations_left: 1,
            max_plan_generations: 1,
          })
          .select()
          .single()

        if (subscriptionError) {
          console.error("Error creating subscription:", subscriptionError)
          return new NextResponse("Error creating subscription", {
            status: 500,
          })
        }

        console.log("Created subscription:", subscription)
      }

      // Create audit log
      try {
        await createAuditLog(id, "user.created", {
          email: email_addresses[0]?.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim(),
          tier: "free",
          status: "active",
        })
      } catch (error) {
        console.error("Error creating audit log:", error)
      }

      console.log(`Successfully created subscription for user: ${id}`)
      return new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    // Handle user deletion
    if (eventType === "user.deleted") {
      const { id } = evt.data
      console.log(`Processing user deletion for: ${id}`)

      // Delete user's data from Supabase
      const tables = ["subscriptions", "marketing_plans", "customers"]
      for (const table of tables) {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq("user_id", id)

        if (error) {
          console.error(`Error deleting from ${table}:`, error)
        }
      }

      // Create audit log
      await createAuditLog(id, "user.deleted", {
        timestamp: new Date().toISOString(),
      })

      console.log(`Successfully cleaned up data for user: ${id}`)
    }

    // Handle user updates
    if (eventType === "user.updated") {
      const { id, email_addresses } = evt.data
      console.log(`Processing user update for: ${id}`)

      // Create audit log
      await createAuditLog(id, "user.updated", {
        email: email_addresses[0]?.email_address,
        timestamp: new Date().toISOString(),
      })
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
} 