import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  console.log('Subscription check webhook called')
  
  try {
    const body = await req.json()
    console.log('Request body:', body)
    
    const userId = body.data.id

    if (!userId) {
      console.log('No user ID provided')
      return NextResponse.json({ error: "No user ID provided" }, { status: 400 })
    }

    // Get current subscription
    const { data: subscription, error: fetchError } = await supabaseAdmin
      .from("subscriptions")
      .select()
      .eq("user_id", userId)
      .single()

    if (fetchError) {
      console.error("Error fetching subscription:", fetchError)
      return NextResponse.json({ error: "Error fetching subscription" }, { status: 500 })
    }

    if (!subscription) {
      console.log('No subscription found for user:', userId)
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    // Log subscription status
    console.log('Checking subscription:', {
      subscriptionId: subscription.id,
      userId: subscription.user_id,
      currentTier: subscription.tier,
      status: subscription.status
    })

    // Return current subscription status
    return NextResponse.json({ 
      success: true,
      subscription
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error("Subscription check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 