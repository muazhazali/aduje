"use client"

import { cn } from "@/lib/utils"
import { getStatusColor } from "@/lib/helpers"
import { type ReportStatus } from "@/lib/types"
import { useTranslations } from "next-intl"

export function StatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  const t = useTranslations()

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        getStatusColor(status),
        className,
      )}
    >
      {t(`status.${status}`)}
    </span>
  )
}
