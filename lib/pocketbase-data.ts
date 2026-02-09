import type { AuditLog, Comment, Notification, Report, ReportCategory, ReportStatus, User } from "./types"
import pb from "./pocketbase"

type PbRecord = Record<string, any>

const toIso = (value?: string) => value || new Date().toISOString()

export type LeaderboardUser = User & { rank: number }

export function mapUser(record: PbRecord): User {
  return {
    id: record.id,
    email: record.email || "",
    name: record.name || record.username || record.email || "Pengguna",
    avatarSeed: record.avatarSeed || record.id,
    points: record.points ?? 0,
    badges: Array.isArray(record.badges) ? record.badges : [],
    isPublic: record.isPublic ?? true,
    isBanned: record.isBanned ?? false,
    isAdmin: record.isAdmin ?? false,
    warnings: record.warnings ?? 0,
    created: toIso(record.created),
    updated: toIso(record.updated || record.created),
  }
}

export function mapReport(record: PbRecord): Report {
  const createdBy = record.expand?.createdBy ? mapUser(record.expand.createdBy) : undefined
  return {
    id: record.id,
    title: record.title || "",
    description: record.description || "",
    category: (record.category || "lain_lain") as ReportCategory,
    photos: Array.isArray(record.photos) ? record.photos : [],
    latitude: record.latitude ?? 0,
    longitude: record.longitude ?? 0,
    address: record.address || "",
    landmark: record.landmark || "",
    status: (record.status || "draft") as ReportStatus,
    createdBy: record.createdBy || "",
    followers: Array.isArray(record.followers) ? record.followers : [],
    upvotes: Array.isArray(record.upvotes) ? record.upvotes : [],
    upvoteCount: record.upvoteCount ?? (Array.isArray(record.upvotes) ? record.upvotes.length : 0),
    confirmations: Array.isArray(record.confirmations) ? record.confirmations : [],
    confirmationCount:
      record.confirmationCount ?? (Array.isArray(record.confirmations) ? record.confirmations.length : 0),
    flagCount: record.flagCount ?? 0,
    flaggedBy: Array.isArray(record.flaggedBy) ? record.flaggedBy : [],
    isHidden: record.isHidden ?? false,
    commentsLocked: record.commentsLocked ?? false,
    created: toIso(record.created),
    updated: toIso(record.updated || record.created),
    expand: createdBy ? { createdBy } : undefined,
  }
}

export function mapComment(record: PbRecord): Comment {
  const user = record.expand?.userId ? mapUser(record.expand.userId) : undefined
  return {
    id: record.id,
    reportId: record.reportId || "",
    userId: record.userId || "",
    content: record.content || "",
    photos: Array.isArray(record.photos) ? record.photos : [],
    parentId: record.parentId || null,
    reactions: record.reactions || { like: [], support: [], urgent: [] },
    isHidden: record.isHidden ?? false,
    created: toIso(record.created),
    updated: toIso(record.updated || record.created),
    expand: user ? { userId: user } : undefined,
  }
}

export function mapNotification(record: PbRecord): Notification {
  return {
    id: record.id,
    userId: record.userId || "",
    type: record.type || "status",
    title: record.title || "",
    message: record.message || "",
    relatedReportId: record.relatedReportId || "",
    relatedCommentId: record.relatedCommentId || "",
    isRead: record.isRead ?? false,
    created: toIso(record.created),
  }
}

export function mapAuditLog(record: PbRecord): AuditLog {
  const admin = record.expand?.adminId ? mapUser(record.expand.adminId) : undefined
  return {
    id: record.id,
    adminId: record.adminId || "",
    action: record.action || "",
    targetType: record.targetType || "",
    targetId: record.targetId || "",
    details: record.details || "",
    reason: record.reason || "",
    created: toIso(record.created),
    expand: admin ? { adminId: admin } : undefined,
  }
}

export function getAuthUser(): User | null {
  if (!pb.authStore.isValid || !pb.authStore.record) return null
  return mapUser(pb.authStore.record)
}

export async function fetchUsers() {
  const records = await pb.collection("users").getFullList({ sort: "-points" })
  return records.map(mapUser)
}

export async function fetchLeaderboardUsers(): Promise<LeaderboardUser[]> {
  const users = await fetchUsers()
  return users.sort((a, b) => b.points - a.points).map((u, i) => ({ ...u, rank: i + 1 }))
}

export async function fetchReports() {
  const records = await pb.collection("reports").getFullList({
    // sort: "-created", // Temporarily removed - causing 400 error
    // expand: "createdBy", // Temporarily removed due to PocketBase API issue
  })

  // Sort manually by created date
  records.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

  // Fetch all unique creator IDs
  const creatorIds = [...new Set(records.map((r) => r.createdBy).filter(Boolean))]

  // Fetch all creators in one batch
  const creators = creatorIds.length > 0 
    ? await pb.collection("users").getFullList({
        filter: creatorIds.map((id) => `id="${id}"`).join(" || "),
      })
    : []

  // Map creators by ID for quick lookup
  const creatorsMap = new Map(creators.map((c) => [c.id, c]))

  // Map reports with expanded creator data
  return records.map((record) => {
    const creator = record.createdBy ? creatorsMap.get(record.createdBy) : null
    const reportData = mapReport(record)
    if (creator) {
      reportData.expand = { createdBy: mapUser(creator) }
    }
    return reportData
  })
}

export async function fetchReportById(id: string) {
  const record = await pb.collection("reports").getOne(id, { expand: "createdBy" })
  return mapReport(record)
}

export async function fetchCommentsByReport(reportId: string) {
  const records = await pb.collection("comments").getFullList({
    filter: `reportId="${reportId}"`,
    // sort: "created", // Removed - causes 400 error, sorting manually instead
    expand: "userId",
  })
  // Sort manually by created date (ascending for comments - oldest first)
  records.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
  return records.map(mapComment)
}

export async function fetchNotificationsByUser(userId: string) {
  const records = await pb.collection("notifications").getFullList({
    filter: `userId="${userId}"`,
    // sort: "-created", // Removed - causes 400 error, sorting manually instead
  })
  // Sort manually by created date
  records.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
  return records.map(mapNotification)
}

export async function fetchAuditLogs() {
  const records = await pb.collection("audit_logs").getFullList({
    // sort: "-created", // Removed - causes 400 error, sorting manually instead
    expand: "adminId",
  })
  // Sort manually by created date
  records.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
  return records.map(mapAuditLog)
}
