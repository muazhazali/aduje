import { create } from "zustand"
import type { User, Report, Notification } from "./types"

interface AppState {
  // Auth
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void

  // Reports cache
  reports: Report[]
  setReports: (reports: Report[]) => void
  addReport: (report: Report) => void
  updateReport: (id: string, data: Partial<Report>) => void

  // Notifications
  notifications: Notification[]
  unreadCount: number
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const useStore = create<AppState>((set) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),

  // Reports
  reports: [],
  setReports: (reports) => set({ reports }),
  addReport: (report) => set((s) => ({ reports: [report, ...s.reports] })),
  updateReport: (id, data) =>
    set((s) => ({
      reports: s.reports.map((r) => (r.id === id ? { ...r, ...data } : r)),
    })),

  // Notifications
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length }),
  addNotification: (notification) =>
    set((s) => ({
      notifications: [notification, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}))
