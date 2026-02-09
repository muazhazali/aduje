/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags and dangerous characters
 */
export function sanitizeHTML(input: string): string {
  if (!input) return ""
  
  // Remove all HTML tags
  let sanitized = input.replace(/<[^>]*>/g, "")
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
  
  return sanitized
}

/**
 * Sanitize user input for display
 * Allows line breaks but removes dangerous content
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return ""
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "")
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "")
  
  // Remove data: protocol (except for images which are validated separately)
  sanitized = sanitized.replace(/data:(?!image\/)/gi, "")
  
  return sanitized
}

/**
 * Validate and sanitize URL
 */
export function sanitizeURL(url: string): string {
  if (!url) return ""
  
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return ""
    }
    
    return parsed.toString()
  } catch {
    return ""
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return ""
  
  // Remove path separators and special characters
  return filename
    .replace(/[\/\\]/g, "")
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  return validTypes.includes(file.type)
}

/**
 * Validate image file size (max 5MB)
 */
export function isValidImageSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSize = maxSizeMB * 1024 * 1024
  return file.size <= maxSize
}

/**
 * Sanitize coordinates to ensure they're valid
 */
export function sanitizeCoordinates(lat: number, lng: number): { lat: number; lng: number } | null {
  if (typeof lat !== "number" || typeof lng !== "number") return null
  if (isNaN(lat) || isNaN(lng)) return null
  if (lat < -90 || lat > 90) return null
  if (lng < -180 || lng > 180) return null
  
  return { lat, lng }
}

/**
 * Rate limiting helper - simple in-memory implementation
 * For production, use Redis or similar
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }
  
  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}

/**
 * Validate report category
 */
export function isValidCategory(category: string): boolean {
  const validCategories = [
    "jalan_raya",
    "lampu_jalan",
    "sampah_sarap",
    "longkang_tersumbat",
    "vandalisme",
    "haiwan_terbiar",
    "lain_lain"
  ]
  return validCategories.includes(category)
}

/**
 * Validate report status
 */
export function isValidStatus(status: string): boolean {
  const validStatuses = ["draft", "open", "acknowledged", "in_progress", "resolved", "rejected"]
  return validStatuses.includes(status)
}
