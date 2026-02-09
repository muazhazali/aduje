import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple in-memory rate limiting (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown"
  return `${ip}-${request.nextUrl.pathname}`
}

function checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60000)

export function middleware(request: NextRequest) {
  // Apply rate limiting to API routes and form submissions
  if (
    request.nextUrl.pathname.startsWith("/api/") ||
    request.method === "POST" ||
    request.method === "PUT" ||
    request.method === "DELETE"
  ) {
    const rateLimitKey = getRateLimitKey(request)
    const allowed = checkRateLimit(rateLimitKey, 100, 60000) // 100 requests per minute
    
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      )
    }
  }
  
  // Add security headers
  const response = NextResponse.next()
  
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff")
  
  // Enable XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block")
  
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  
  // Permissions policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()"
  )
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
