"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { BoringAvatar } from "./boring-avatar"
import { Home, Map, PlusCircle, Bell, Trophy, Shield, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const DESKTOP_NAV = [
  { href: "/", icon: Home, label: "Feed" },
  { href: "/map", icon: Map, label: "Map" },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
]

export function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, unreadCount } = useStore()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card" role="banner">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">R</span>
          </div>
          <span className="hidden text-base font-bold text-foreground sm:inline">ReporterMY</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Desktop navigation">
          {DESKTOP_NAV.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Search */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {searchOpen ? (
            <Input
              type="search"
              placeholder="Search reports..."
              className="max-w-xs"
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Create */}
          <Link href="/create">
            <Button size="sm" className="hidden gap-1.5 md:flex">
              <PlusCircle className="h-4 w-4" />
              Report
            </Button>
          </Link>

          {/* Notifications */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Admin */}
          {user?.isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" size="icon" aria-label="Admin dashboard">
                <Shield className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* Profile */}
          {isAuthenticated && user ? (
            <Link href="/profile" className="shrink-0">
              <BoringAvatar seed={user.avatarSeed} size={32} />
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
