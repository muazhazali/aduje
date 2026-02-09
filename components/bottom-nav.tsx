"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Map, PlusCircle, Bell, User } from "lucide-react"
import { useStore } from "@/lib/store"

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Feed" },
  { href: "/map", icon: Map, label: "Map" },
  { href: "/create", icon: PlusCircle, label: "Report" },
  { href: "/notifications", icon: Bell, label: "Alerts" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
  const pathname = usePathname()
  const unreadCount = useStore((s) => s.unreadCount)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card md:hidden" role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-2.5 text-xs transition-colors",
                isActive ? "text-primary font-semibold" : "text-muted-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.href === "/notifications" && unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
      {/* Safe area for iPhone notch */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
