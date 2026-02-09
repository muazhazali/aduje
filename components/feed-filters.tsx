"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { REPORT_CATEGORIES, REPORT_STATUSES, type ReportCategory, type ReportStatus } from "@/lib/types"
import { SlidersHorizontal, X } from "lucide-react"
import { useTranslations } from "next-intl"

interface FeedFiltersProps {
  selectedCategory: string
  selectedStatus: string
  sortBy: string
  onCategoryChange: (v: string) => void
  onStatusChange: (v: string) => void
  onSortChange: (v: string) => void
  onClear: () => void
}

export function FeedFilters({
  selectedCategory,
  selectedStatus,
  sortBy,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  onClear,
}: FeedFiltersProps) {
  const hasFilters = selectedCategory !== "all" || selectedStatus !== "all" || sortBy !== "recent"
  const t = useTranslations()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
          <SelectValue placeholder={t("filters.category")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
          {(REPORT_CATEGORIES as ReportCategory[]).map((cat) => (
            <SelectItem key={cat} value={cat}>
              {t(`categories.${cat}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="h-8 w-auto min-w-[110px] text-xs">
          <SelectValue placeholder={t("filters.status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
          {(REPORT_STATUSES as ReportStatus[])
            .filter((s) => s !== "draft")
            .map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status.${s}`)}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
          <SelectValue placeholder={t("filters.sortBy")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">{t("filters.mostRecent")}</SelectItem>
          <SelectItem value="upvoted">{t("filters.mostUpvoted")}</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-8 gap-1 text-xs">
          <X className="h-3 w-3" />
          {t("actions.clear")}
        </Button>
      )}
    </div>
  )
}
