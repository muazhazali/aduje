"use client"

import { cn } from "@/lib/utils"
import { CATEGORY_LABELS, type ReportCategory } from "@/lib/types"
import {
  Construction,
  Lightbulb,
  Trash2,
  Droplets,
  AlertTriangle,
  TreePine,
  Building,
  Cat,
  Volume2,
  CircleHelp,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const CATEGORY_ICON_MAP: Record<ReportCategory, LucideIcon> = {
  jalan_raya: Construction,
  lampu_jalan: Lightbulb,
  sampah_sarap: Trash2,
  longkang_tersumbat: Droplets,
  vandalisme: AlertTriangle,
  taman_landskap: TreePine,
  kemudahan_awam: Building,
  haiwan_terbiar: Cat,
  bunyi_bising: Volume2,
  lain_lain: CircleHelp,
}

const CATEGORY_COLORS: Record<ReportCategory, string> = {
  jalan_raya: "bg-primary/10 text-primary",
  lampu_jalan: "bg-secondary/20 text-secondary-foreground",
  sampah_sarap: "bg-status-closed/10 text-status-closed",
  longkang_tersumbat: "bg-status-in-progress/10 text-status-in-progress",
  vandalisme: "bg-status-open/10 text-status-open",
  taman_landskap: "bg-status-closed/10 text-status-closed",
  kemudahan_awam: "bg-accent/10 text-accent",
  haiwan_terbiar: "bg-secondary/20 text-secondary-foreground",
  bunyi_bising: "bg-status-acknowledged/10 text-status-acknowledged",
  lain_lain: "bg-muted text-muted-foreground",
}

export function CategoryIcon({ category, className }: { category: ReportCategory; className?: string }) {
  const Icon = CATEGORY_ICON_MAP[category] || CircleHelp
  return <Icon className={className} />
}

export function CategoryBadge({
  category,
  showIcon = true,
  className,
}: {
  category: ReportCategory
  showIcon?: boolean
  className?: string
}) {
  const Icon = CATEGORY_ICON_MAP[category] || CircleHelp
  const label = CATEGORY_LABELS[category]
  const shortLabel = label.split(" (")[0]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        CATEGORY_COLORS[category],
        className,
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {shortLabel}
    </span>
  )
}
