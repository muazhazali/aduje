"use client"

import { useState, useMemo } from "react"
import { MOCK_REPORTS } from "@/lib/mock-data"
import { ReportCard } from "@/components/report-card"
import { FeedFilters } from "@/components/feed-filters"
import { LeaderboardWidget } from "@/components/leaderboard-widget"
import { Input } from "@/components/ui/input"
import { Search, FileWarning } from "lucide-react"
import type { ReportCategory, ReportStatus } from "@/lib/types"

export default function FeedPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const filtered = useMemo(() => {
    let reports = MOCK_REPORTS.filter((r) => r.status !== "draft" && !r.isHidden)

    if (search.trim()) {
      const q = search.toLowerCase()
      reports = reports.filter(
        (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.address.toLowerCase().includes(q),
      )
    }

    if (category !== "all") {
      reports = reports.filter((r) => r.category === (category as ReportCategory))
    }

    if (status !== "all") {
      reports = reports.filter((r) => r.status === (status as ReportStatus))
    }

    if (sortBy === "upvoted") {
      reports = [...reports].sort((a, b) => b.upvoteCount - a.upvoteCount)
    } else {
      reports = [...reports].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    }

    return reports
  }, [search, category, status, sortBy])

  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      {/* Hero */}
      <div className="mb-6 rounded-xl bg-primary px-6 py-6 text-primary-foreground">
        <h1 className="text-balance text-xl font-bold sm:text-2xl">Report Local Issues in Your Community</h1>
        <p className="mt-1 text-sm opacity-90">
          Help improve Malaysia, one report at a time. Jom buat laporan!
        </p>
        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input
            type="search"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 border-0 bg-card pl-9 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main Feed */}
        <div className="flex-1">
          <div className="mb-4">
            <FeedFilters
              selectedCategory={category}
              selectedStatus={status}
              sortBy={sortBy}
              onCategoryChange={setCategory}
              onStatusChange={setStatus}
              onSortChange={setSortBy}
              onClear={() => {
                setCategory("all")
                setStatus("all")
                setSortBy("recent")
              }}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
              <FileWarning className="h-12 w-12 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">No reports found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <LeaderboardWidget />
          </div>
        </div>
      </div>
    </div>
  )
}
