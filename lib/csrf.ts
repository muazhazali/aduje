/**
 * CSRF Protection Utilities
 * For client-side form submissions
 */

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * Store CSRF token in session storage
 */
export function storeCSRFToken(token: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("csrf_token", token)
  }
}

/**
 * Get CSRF token from session storage
 */
export function getCSRFToken(): string | null {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("csrf_token")
  }
  return null
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken()
  return storedToken !== null && storedToken === token
}

/**
 * Initialize CSRF token on app load
 */
export function initCSRFToken(): string {
  let token = getCSRFToken()
  if (!token) {
    token = generateCSRFToken()
    storeCSRFToken(token)
  }
  return token
}

/**
 * Add CSRF token to request headers
 */
export function addCSRFHeader(headers: HeadersInit = {}): HeadersInit {
  const token = getCSRFToken()
  if (token) {
    return {
      ...headers,
      "X-CSRF-Token": token,
    }
  }
  return headers
}
