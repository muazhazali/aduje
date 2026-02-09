"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { MOCK_REPORTS, MOCK_USERS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { CategoryBadge } from "@/components/category-badge"
import { BoringAvatar } from "@/components/boring-avatar"
import { formatRelativeTime, formatPoints } from "@/lib/helpers"
import { STATUS_LABELS, type ReportStatus } from "@/lib/types"
import {
  Shield,
  FileText,
  Users,
  Flag,
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Ban,
  UserCheck,
  ClipboardList,
  BarChart3,
  MessageCircle,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function AdminDashboardPage() {
  const { user } = useStore()

  // For demo, show admin dashboard even if user is not admin
  const allReports = MOCK_REPORTS
  const flaggedReports = allReports.filter((r) => r.flagCount > 0)
  const allUsers = MOCK_USERS
  const [auditLogs] = useState([
    { id: "log1", admin: "Admin Moderator", action: "Changed status", target: "Report: Lubang besar di Jalan Ampang", time: "2026-02-08T10:00:00Z", details: "open -> acknowledged" },
    { id: "log2", admin: "Admin Moderator", action: "Posted comment", target: "Report: Sampah bertimbun di Pasar Chow Kit", time: "2026-02-07T10:00:00Z", details: "Official update" },
    { id: "log3", admin: "Admin Moderator", action: "Warned user", target: "User: Ali Hassan", time: "2026-02-06T09:00:00Z", details: "Repeated spam reports" },
  ])

  const openCount = allReports.filter((r) => r.status === "open").length
  const inProgressCount = allReports.filter((r) => r.status === "in_progress").length
  const closedCount = allReports.filter((r) => r.status === "closed").length
  const totalComments = 5

  const handleStatusChange = (reportId: string, newStatus: string) => {
    toast.success(`Status updated to ${STATUS_LABELS[newStatus as ReportStatus]}`)
  }

  const handleHideReport = (reportId: string) => {
    toast.success("Report hidden from public view")
  }

  const handleLockComments = (reportId: string) => {
    toast.success("Comments locked on report")
  }

  const handleWarnUser = (userId: string) => {
    toast.success("Warning sent to user")
  }

  const handleBanUser = (userId: string) => {
    toast.success("User has been banned")
  }

  const handleUnbanUser = (userId: string) => {
    toast.success("User has been unbanned")
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
      </div>

      {/* Stats overview */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{allReports.length}</p>
              <p className="text-xs text-muted-foreground">Total Reports</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-open/10">
              <AlertTriangle className="h-5 w-5 text-status-open" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{openCount}</p>
              <p className="text-xs text-muted-foreground">Open Issues</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-in-progress/10">
              <Users className="h-5 w-5 text-status-in-progress" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{allUsers.length}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-closed/10">
              <MessageCircle className="h-5 w-5 text-status-closed" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalComments}</p>
              <p className="text-xs text-muted-foreground">Comments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="reports">
        <TabsList className="w-full flex-wrap h-auto">
          <TabsTrigger value="reports" className="gap-1">
            <FileText className="h-3.5 w-3.5" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="flagged" className="gap-1">
            <Flag className="h-3.5 w-3.5" />
            Flagged
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1">
            <Users className="h-3.5 w-3.5" />
            Users
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1">
            <ClipboardList className="h-3.5 w-3.5" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* Reports Management */}
        <TabsContent value="reports" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">All Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {allReports.map((report) => (
                  <div key={report.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
                    <div className="flex-1 min-w-0">
                      <Link href={`/report/${report.id}`} className="text-sm font-medium text-foreground hover:text-primary">
                        {report.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={report.status} />
                        <CategoryBadge category={report.category} showIcon={false} />
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(report.created)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Select
                        value={report.status}
                        onValueChange={(v) => handleStatusChange(report.id, v)}
                      >
                        <SelectTrigger className="h-7 w-auto text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(STATUS_LABELS) as ReportStatus[])
                            .filter((s) => s !== "draft")
                            .map((s) => (
                              <SelectItem key={s} value={s}>
                                {STATUS_LABELS[s]}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleHideReport(report.id)} title="Toggle visibility">
                        {report.isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleLockComments(report.id)} title="Toggle comments">
                        {report.commentsLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flagged Content */}
        <TabsContent value="flagged" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Flagged Content</CardTitle>
            </CardHeader>
            <CardContent>
              {flaggedReports.length === 0 ? (
                <div className="py-8 text-center">
                  <Flag className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No flagged content</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {flaggedReports.map((report) => (
                    <div key={report.id} className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{report.title}</p>
                        <p className="text-xs text-muted-foreground">{report.flagCount} flags</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        Dismiss
                      </Button>
                      <Button variant="destructive" size="sm" className="text-xs">
                        Hide
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {allUsers.map((u) => (
                  <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
                    <BoringAvatar seed={u.avatarSeed} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{u.name}</p>
                        {u.isAdmin && (
                          <Badge variant="outline" className="text-xs">
                            Admin
                          </Badge>
                        )}
                        {u.isBanned && (
                          <Badge variant="destructive" className="text-xs">
                            Banned
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatPoints(u.points)} pts</span>
                        <span>{u.warnings} warnings</span>
                        <span>{u.badges.length} badges</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!u.isAdmin && (
                        <>
                          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs bg-transparent" onClick={() => handleWarnUser(u.id)}>
                            <AlertTriangle className="h-3 w-3" />
                            Warn
                          </Button>
                          {u.isBanned ? (
                            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs bg-transparent" onClick={() => handleUnbanUser(u.id)}>
                              <UserCheck className="h-3 w-3" />
                              Unban
                            </Button>
                          ) : (
                            <Button variant="destructive" size="sm" className="h-7 gap-1 text-xs" onClick={() => handleBanUser(u.id)}>
                              <Ban className="h-3 w-3" />
                              Ban
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs */}
        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 border-l-2 border-border pl-3">
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{log.admin}</span>
                        {" "}{log.action}
                      </p>
                      <p className="text-xs text-muted-foreground">{log.target}</p>
                      {log.details && <p className="text-xs text-muted-foreground italic">{log.details}</p>}
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatRelativeTime(log.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
