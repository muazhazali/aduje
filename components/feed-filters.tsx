"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORY_LABELS, STATUS_LABELS, type ReportCategory, type ReportStatus } from "@/lib/types"
import { SlidersHorizontal, X } from "lucide-react"

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {(Object.keys(CATEGORY_LABELS) as ReportCategory[]).map((cat) => (
            <SelectItem key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="h-8 w-auto min-w-[110px] text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {(Object.keys(STATUS_LABELS) as ReportStatus[])
            .filter((s) => s !== "draft")
            .map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Most Recent</SelectItem>
          <SelectItem value="upvoted">Most Upvoted</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-8 gap-1 text-xs">
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  )
}
