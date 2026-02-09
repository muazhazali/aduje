"use client"

import React from "react"

import { Header } from "./header"
import { BottomNav } from "./bottom-nav"
import { useStore } from "@/lib/store"
import { useEffect } from "react"
import { fetchNotificationsByUser, getAuthUser } from "@/lib/pocketbase-data"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { setUser, setNotifications, isAuthenticated } = useStore()

  useEffect(() => {
    const authUser = getAuthUser()
    if (authUser) {
      setUser(authUser)
      fetchNotificationsByUser(authUser.id)
        .then(setNotifications)
        .catch(() => setNotifications([]))
      return
    }

    if (isAuthenticated) {
      setUser(null)
      setNotifications([])
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
