export type ReportStatus = "draft" | "open" | "acknowledged" | "in_progress" | "closed"

export type ReportCategory =
  | "jalan_raya"
  | "lampu_jalan"
  | "sampah_sarap"
  | "longkang_tersumbat"
  | "vandalisme"
  | "taman_landskap"
  | "kemudahan_awam"
  | "haiwan_terbiar"
  | "bunyi_bising"
  | "lain_lain"

export const REPORT_CATEGORIES: ReportCategory[] = [
  "jalan_raya",
  "lampu_jalan",
  "sampah_sarap",
  "longkang_tersumbat",
  "vandalisme",
  "taman_landskap",
  "kemudahan_awam",
  "haiwan_terbiar",
  "bunyi_bising",
  "lain_lain",
]

export const REPORT_STATUSES: ReportStatus[] = ["draft", "open", "acknowledged", "in_progress", "closed"]

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  jalan_raya: "Jalan Raya",
  lampu_jalan: "Lampu Jalan",
  sampah_sarap: "Sampah Sarap",
  longkang_tersumbat: "Longkang Tersumbat",
  vandalisme: "Vandalisme",
  taman_landskap: "Taman & Landskap",
  kemudahan_awam: "Kemudahan Awam",
  haiwan_terbiar: "Haiwan Terbiar",
  bunyi_bising: "Bunyi Bising",
  lain_lain: "Lain-lain",
}

export const CATEGORY_ICONS: Record<ReportCategory, string> = {
  jalan_raya: "construction",
  lampu_jalan: "lightbulb",
  sampah_sarap: "trash-2",
  longkang_tersumbat: "droplets",
  vandalisme: "alert-triangle",
  taman_landskap: "trees",
  kemudahan_awam: "building",
  haiwan_terbiar: "cat",
  bunyi_bising: "volume-2",
  lain_lain: "circle-help",
}

export const STATUS_LABELS: Record<ReportStatus, string> = {
  draft: "Draf",
  open: "Terbuka",
  acknowledged: "Diakui",
  in_progress: "Dalam Proses",
  closed: "Selesai",
}

export interface User {
  id: string
  email: string
  name: string
  avatarSeed: string
  points: number
  badges: string[]
  isPublic: boolean
  isBanned: boolean
  isAdmin: boolean
  warnings: number
  created: string
  updated: string
}

export interface Report {
  id: string
  title: string
  description: string
  category: ReportCategory
  photos: string[]
  latitude: number
  longitude: number
  address: string
  landmark: string
  status: ReportStatus
  createdBy: string
  followers: string[]
  upvotes: string[]
  upvoteCount: number
  confirmations: string[]
  confirmationCount: number
  flagCount: number
  flaggedBy: string[]
  isHidden: boolean
  commentsLocked: boolean
  created: string
  updated: string
  expand?: {
    createdBy?: User
  }
}

export interface Comment {
  id: string
  reportId: string
  userId: string
  content: string
  photos: string[]
  parentId: string | null
  reactions: {
    like: string[]
    support: string[]
    urgent: string[]
  }
  isHidden: boolean
  created: string
  updated: string
  expand?: {
    userId?: User
  }
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  relatedReportId: string
  relatedCommentId: string
  isRead: boolean
  created: string
}

export interface AuditLog {
  id: string
  adminId: string
  action: string
  targetType: string
  targetId: string
  details: string
  reason: string
  created: string
  expand?: {
    adminId?: User
  }
}

export interface Flag {
  id: string
  reportId: string
  commentId: string
  flaggedBy: string
  reason: string
  status: string
  reviewedBy: string
  created: string
}
