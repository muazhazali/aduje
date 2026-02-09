"use client"

import React from "react"

import { Header } from "./header"
import { BottomNav } from "./bottom-nav"
import { useStore } from "@/lib/store"
import { useEffect } from "react"
import { MOCK_USERS, MOCK_NOTIFICATIONS } from "@/lib/mock-data"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { setUser, setNotifications, isAuthenticated } = useStore()

  // Auto-login with mock user for demo
  useEffect(() => {
    if (!isAuthenticated) {
      setUser(MOCK_USERS[0]) // Login as Ahmad
      setNotifications(MOCK_NOTIFICATIONS)
    }
  }, [isAuthenticated, setUser, setNotifications])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  )
}
