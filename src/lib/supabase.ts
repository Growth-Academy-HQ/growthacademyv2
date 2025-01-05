import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our schema
export type Database = {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'free' | 'growth-pro' | 'growth-expert'
          status: 'active' | 'canceled' | 'past_due'
          current_period_end: string
          plan_generations_left: number
          max_plan_generations: number
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier: 'free' | 'growth-pro' | 'growth-expert'
          status?: 'active' | 'canceled' | 'past_due'
          current_period_end?: string
          plan_generations_left?: number
          max_plan_generations?: number
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier?: 'free' | 'growth-pro' | 'growth-expert'
          status?: 'active' | 'canceled' | 'past_due'
          current_period_end?: string
          plan_generations_left?: number
          max_plan_generations?: number
          stripe_subscription_id?: string | null
          updated_at?: string
        }
      }
      marketing_plans: {
        Row: {
          id: string
          user_id: string
          business_name: string
          industry: string
          plan: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          industry: string
          plan: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          industry?: string
          plan?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          user_id: string
          expert_id: string
          content: string
          created_at: string
          read: boolean
        }
        Insert: {
          id?: string
          user_id: string
          expert_id: string
          content: string
          created_at?: string
          read?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          expert_id?: string
          content?: string
          created_at?: string
          read?: boolean
        }
      }
      experts: {
        Row: {
          id: string
          name: string
          role: string
          avatar: string
          expertise: string[]
          available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          avatar: string
          expertise: string[]
          available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          avatar?: string
          expertise?: string[]
          available?: boolean
          created_at?: string
        }
      }
    }
  }
} 