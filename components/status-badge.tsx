"use client"

import { cn } from "@/lib/utils"
import { getStatusColor } from "@/lib/helpers"
import { STATUS_LABELS, type ReportStatus } from "@/lib/types"

export function StatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        getStatusColor(status),
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
