import { NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { getAuth } from "@clerk/nextjs/server"
import { z } from "zod"
import { rateLimits } from "./security"
import { createAuditLog } from "./security"

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(rateLimits.api.max, rateLimits.api.window),
})

// CORS headers
const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
}

// Error response helper with logging
export function errorResponse(message: string, status: number = 400, error?: any) {
  console.error(`[API_ERROR] ${message}`, error)
  
  const headers = new Headers()
  headers.set("Content-Type", "application/json")
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value)
  })

  return new NextResponse(
    JSON.stringify({
      error: message,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    }),
    {
      status,
      headers,
    }
  )
}

// Success response helper
export function successResponse(data: any, status: number = 200) {
  const headers = new Headers()
  headers.set("Content-Type", "application/json")
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value)
  })

  return new NextResponse(
    JSON.stringify({
      data,
      timestamp: new Date().toISOString()
    }), 
    {
      status,
      headers,
    }
  )
}

// Request validation helper
export function validateRequest<T>(schema: z.Schema<T>) {
  return async (req: Request): Promise<T> => {
    try {
      const body = await req.json()
      return schema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(", ")}`)
      }
      throw error
    }
  }
}

// Enhanced middleware wrapper for API routes
export function withApiMiddleware(handler: Function) {
  return async (req: Request) => {
    const requestId = crypto.randomUUID()
    const startTime = Date.now()

    try {
      // Handle CORS
      if (req.method === "OPTIONS") {
        const headers = new Headers()
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value)
        })
        return new NextResponse(null, { headers })
      }

      // Validate content type for POST/PUT requests
      if (["POST", "PUT"].includes(req.method || "") && 
          !req.headers.get("content-type")?.includes("application/json")) {
        return errorResponse("Content-Type must be application/json", 415)
      }

      // Check authentication
      const { userId } = getAuth(req as any)
      if (!userId) {
        return errorResponse("Unauthorized", 401)
      }

      // Rate limiting
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
      const { success, limit, reset, remaining } = await ratelimit.limit(
        `${ip}:${userId}`
      )

      if (!success) {
        return errorResponse(
          `Rate limit exceeded. Try again in ${Math.ceil(
            (reset - Date.now()) / 1000
          )} seconds`,
          429
        )
      }

      // Call the actual handler
      const response = await handler(req, userId)
      
      // Add response headers
      response.headers.set("X-Request-ID", requestId)
      response.headers.set("X-Response-Time", `${Date.now() - startTime}ms`)
      response.headers.set("X-RateLimit-Limit", limit.toString())
      response.headers.set("X-RateLimit-Remaining", remaining.toString())
      response.headers.set("X-RateLimit-Reset", reset.toString())
      
      // Add CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      // Log successful request
      await createAuditLog(userId, "api_request", {
        method: req.method,
        path: new URL(req.url).pathname,
        status: response.status,
        duration: Date.now() - startTime,
        ip_address: ip,
        user_agent: req.headers.get("user-agent"),
        request_id: requestId
      })

      return response
    } catch (error) {
      // Log error
      console.error("[API_ERROR]", {
        error,
        request_id: requestId,
        method: req.method,
        path: new URL(req.url).pathname,
        duration: Date.now() - startTime
      })

      return errorResponse(
        error instanceof Error ? error.message : "Internal Server Error",
        error instanceof Error && "status" in error ? (error as any).status : 500,
        error
      )
    }
  }
} 