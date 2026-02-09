"use client"

import React from "react"

import { useStore } from "@/lib/store"
import { formatRelativeTime } from "@/lib/helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, ThumbsUp, MessageCircle, Award, AlertTriangle, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const NOTIF_ICONS: Record<string, React.ElementType> = {
  upvote: ThumbsUp,
  comment: MessageCircle,
  badge: Award,
  status: Bell,
  warning: AlertTriangle,
}

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useStore()

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
        </h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="gap-1.5 text-xs text-muted-foreground">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Bell className="h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif) => {
            const Icon = NOTIF_ICONS[notif.type] || Bell
            const content = (
              <Card
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/50",
                  !notif.isRead && "border-l-2 border-l-primary",
                )}
              >
                <CardContent className="flex items-start gap-3 p-3">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    notif.isRead ? "bg-muted" : "bg-primary/10",
                  )}>
                    <Icon className={cn("h-4 w-4", notif.isRead ? "text-muted-foreground" : "text-primary")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !notif.isRead && "font-semibold text-foreground")}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatRelativeTime(notif.created)}</p>
                  </div>
                </CardContent>
              </Card>
            )

            if (notif.relatedReportId) {
              return (
                <Link key={notif.id} href={`/report/${notif.relatedReportId}`} onClick={() => markAsRead(notif.id)}>
                  {content}
                </Link>
              )
            }

            return (
              <div key={notif.id} onClick={() => markAsRead(notif.id)} onKeyDown={() => markAsRead(notif.id)} role="button" tabIndex={0}>
                {content}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
