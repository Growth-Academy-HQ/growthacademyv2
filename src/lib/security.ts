import crypto from 'crypto'
import { supabase } from "@/lib/supabase"

// Security Headers Configuration
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://clerk.growth-academy.com https://api.clerk.dev; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-src 'self' https://js.stripe.com https://clerk.growth-academy.com; " +
    "connect-src 'self' https://api.clerk.dev https://api.stripe.com https://api.anthropic.com https://*.supabase.co wss://*.supabase.co https://fonts.googleapis.com https://fonts.gstatic.com;",
  
  // Other Security Headers
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self), fullscreen=(self)',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin'
}

// Input Sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: URIs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/\b(eval|setTimeout|setInterval)\b/gi, '') // Remove dangerous JS functions
    .replace(/&#/g, '') // Remove HTML entities
    .replace(/\\x[0-9A-Fa-f]{2}/g, '') // Remove hex escapes
    .replace(/\\u[0-9A-Fa-f]{4}/g, '') // Remove unicode escapes
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim()
}

// API Key Rotation Helper
export function generateApiKey(): string {
  return `gak_${crypto.randomBytes(32).toString('hex')}`
}

// Audit Log Types
export type AuditLogAction = 
  | 'login'
  | 'logout'
  | 'create_plan'
  | 'delete_plan'
  | 'subscribe'
  | 'unsubscribe'
  | 'send_message'
  | 'update_subscription'
  | 'create_expert'
  | 'update_expert'
  | 'view_expert'
  | 'view_experts'
  | 'api_request'

// Audit Logging
export async function createAuditLog(
  userId: string,
  action: AuditLogAction,
  details: Record<string, any>
) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        details,
        ip_address: details.ip_address,
        user_agent: details.user_agent,
      })

    if (error) throw error
    return data
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR]', error)
    // Don't throw - audit logging should not break the main flow
  }
}

// Rate limiting configuration
export const rateLimits = {
  api: {
    window: '10 s',
    max: 10
  },
  auth: {
    window: '1 h',
    max: 5
  },
  subscription: {
    window: '1 d',
    max: 3
  }
} as const

// Password validation
export function validatePassword(password: string): boolean {
  const minLength = 12
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
}

// Token validation
export function validateToken(token: string): boolean {
  // Check if token is in expected JWT format
  const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
  return jwtRegex.test(token)
} 