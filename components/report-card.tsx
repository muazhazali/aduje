"use client"

import Link from "next/link"
import type { Report } from "@/lib/types"
import { formatRelativeTime } from "@/lib/helpers"
import { StatusBadge } from "./status-badge"
import { CategoryBadge, CategoryIcon } from "./category-badge"
import { BoringAvatar } from "./boring-avatar"
import { ThumbsUp, MessageCircle, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function ReportCard({ report }: { report: Report }) {
  const user = report.expand?.createdBy

  return (
    <Link href={`/report/${report.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Thumbnail / category icon */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
              <CategoryIcon category={report.category} className="h-7 w-7 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
              {/* Title */}
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                {report.title}
              </h3>

              {/* Badges */}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <StatusBadge status={report.status} />
                <CategoryBadge category={report.category} showIcon={false} />
              </div>

              {/* Location */}
              {report.address && (
                <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{report.address}</span>
                </div>
              )}

              {/* Footer */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ThumbsUp className="h-3 w-3" />
                    {report.upvoteCount}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="h-3 w-3" />
                    {report.followers.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {user && <BoringAvatar seed={user.avatarSeed} size={18} />}
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(report.created)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
