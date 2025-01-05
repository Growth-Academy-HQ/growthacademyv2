import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  try {
    const { userId } = await getAuth(req)
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { plan, businessName, industry, date } = await req.json()
    const supabase = createRouteHandlerClient({ cookies })

    // Check user's subscription and plan generations left
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (subError) {
      console.error('Error fetching subscription:', subError)
      return new NextResponse('Error checking subscription', { status: 500 })
    }

    if (subscription.plan_generations_left <= 0) {
      return new NextResponse('No plan generations left', { status: 403 })
    }

    // Save the plan
    const { data, error } = await supabase
      .from('marketing_plans')
      .insert([
        {
          user_id: userId,
          business_name: businessName,
          industry,
          plan,
          created_at: date,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error saving plan:', error)
      return new NextResponse('Error saving plan', { status: 500 })
    }

    // Update plan generations left
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ 
        plan_generations_left: subscription.plan_generations_left - 1 
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating plan generations:', updateError)
      // Don't return error since plan was saved successfully
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in save-plan route:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 