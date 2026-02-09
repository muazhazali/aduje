/**
 * Authentication utilities for demo and production environments
 */

import pb from "./pocketbase"
import type { User } from "./types"
import { mapUser } from "./pocketbase-data"

/**
 * Demo user credentials for quick login
 * In production, these would use real OAuth or password authentication
 */
export const DEMO_CREDENTIALS = [
  { email: "ahmad.demo@example.com", password: "DemoPass123!", name: "Ahmad Ibrahim" },
  { email: "siti.demo@example.com", password: "DemoPass123!", name: "Siti Nurhaliza" },
  { email: "kumar.demo@example.com", password: "DemoPass123!", name: "Kumar Rajesh" },
  { email: "lim.demo@example.com", password: "DemoPass123!", name: "Lim Wei Jian" },
] as const

/**
 * Authenticate with email and password
 * This creates a proper PocketBase auth session with cookies
 */
export async function loginWithPassword(email: string, password: string): Promise<User> {
  const authData = await pb.collection("users").authWithPassword(email, password)
  
  if (!authData.record) {
    throw new Error("Authentication failed - no user record returned")
  }
  
  return mapUser(authData.record)
}

/**
 * Authenticate with OAuth2 provider (Google, etc.)
 */
export async function loginWithOAuth(provider: string): Promise<User> {
  const authData = await pb.collection("users").authWithOAuth2({ provider })
  
  if (!authData.record) {
    throw new Error("OAuth authentication failed - no user record returned")
  }
  
  return mapUser(authData.record)
}

/**
 * Logout and clear auth session
 */
export function logout(): void {
  pb.authStore.clear()
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return pb.authStore.isValid
}

/**
 * Get current authenticated user
 */
export function getCurrentAuthUser(): User | null {
  if (!pb.authStore.isValid || !pb.authStore.record) {
    return null
  }
  
  return mapUser(pb.authStore.record)
}

/**
 * Refresh authentication token
 * Call this periodically to keep the session alive
 */
export async function refreshAuth(): Promise<void> {
  if (!pb.authStore.isValid) {
    throw new Error("No valid auth session to refresh")
  }
  
  await pb.collection("users").authRefresh()
}
