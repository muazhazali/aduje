"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { BoringAvatar } from "./boring-avatar"
import { Home, Map, PlusCircle, Bell, Trophy, Shield, Search, Languages } from "lucide-react"
import { Button } from "@govtechmy/myds-react/button"
import { Input } from "@govtechmy/myds-react/input"
import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"

import pb from "@/lib/pocketbase"

export function Header() {
  const pathname = usePathname()
  const { user, unreadCount } = useStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const t = useTranslations()
  const locale = useLocale()
  
  // Check authentication: Either PocketBase is valid OR we have a user in Zustand (demo mode)
  const isAuthenticated = (pb.authStore.isValid || user !== null) && user !== null

  const toggleLanguage = () => {
    const newLocale = locale === "ms" ? "en" : "ms"
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`
    window.location.reload()
  }

  const desktopNav = [
    { href: "/", icon: Home, label: t("nav.feed") },
    { href: "/map", icon: Map, label: t("nav.map") },
    { href: "/leaderboard", icon: Trophy, label: t("nav.leaderboard") },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card" role="banner">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">A</span>
          </div>
          <span className="hidden text-base font-bold text-foreground sm:inline">AduJe</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label={t("nav.desktopAria")}>
          {desktopNav.map((item) => {
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
              placeholder={t("search.placeholder")}
              className="max-w-xs"
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
          ) : (
            <Button
              variant="default-ghost"
              size="small"
              onClick={() => setSearchOpen(true)}
              aria-label={t("actions.search")}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Create */}
          <Link href="/create">
            <Button variant="primary-fill" size="small" className="hidden gap-1.5 md:flex">
              <PlusCircle className="h-4 w-4" />
              {t("nav.report")}
            </Button>
          </Link>

          {/* Language Switcher */}
          <Button
            variant="default-ghost"
            size="small"
            onClick={toggleLanguage}
            aria-label="Switch language"
            className="gap-1"
          >
            <Languages className="h-4 w-4" />
            <span className="hidden text-xs font-medium sm:inline">{locale === "ms" ? "EN" : "MS"}</span>
          </Button>

          {/* Notifications */}
          <Link href="/notifications">
            <Button
              variant="default-ghost"
              size="small"
              className="relative"
              aria-label={t("nav.notifications")}
            >
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
              <Button variant="default-ghost" size="small" aria-label={t("nav.admin")}>
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
              <Button variant="default-outline" size="small">
                {t("actions.signIn")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
