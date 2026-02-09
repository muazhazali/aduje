import type { ReportStatus } from "./types"

export function getStatusColor(status: ReportStatus): string {
  const map: Record<ReportStatus, string> = {
    draft: "bg-muted text-muted-foreground",
    open: "bg-status-open text-white",
    acknowledged: "bg-status-acknowledged text-white",
    in_progress: "bg-status-in-progress text-white",
    closed: "bg-status-closed text-white",
  }
  return map[status] || "bg-muted text-muted-foreground"
}

export function getStatusDot(status: ReportStatus): string {
  const map: Record<ReportStatus, string> = {
    draft: "bg-muted-foreground",
    open: "bg-status-open",
    acknowledged: "bg-status-acknowledged",
    in_progress: "bg-status-in-progress",
    closed: "bg-status-closed",
  }
  return map[status] || "bg-muted-foreground"
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })
}

export function formatPoints(points: number): string {
  if (points >= 1000) return `${(points / 1000).toFixed(1)}k`
  return points.toString()
}

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 17)
}
