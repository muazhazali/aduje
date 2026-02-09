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
import { REPORT_STATUSES, type ReportStatus } from "@/lib/types"
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
import { useTranslations } from "next-intl"

export default function AdminDashboardPage() {
  const { user } = useStore()
  const t = useTranslations()

  // For demo, show admin dashboard even if user is not admin
  const allReports = MOCK_REPORTS
  const flaggedReports = allReports.filter((r) => r.flagCount > 0)
  const allUsers = MOCK_USERS
  const [auditLogs] = useState([
    {
      id: "log1",
      admin: "Admin Moderator",
      action: t("admin.logs.changedStatus"),
      target: t("admin.logs.sampleReport1"),
      time: "2026-02-08T10:00:00Z",
      details: "open -> acknowledged",
    },
    {
      id: "log2",
      admin: "Admin Moderator",
      action: t("admin.logs.postedComment"),
      target: t("admin.logs.sampleReport2"),
      time: "2026-02-07T10:00:00Z",
      details: t("admin.logs.officialUpdate"),
    },
    {
      id: "log3",
      admin: "Admin Moderator",
      action: t("admin.logs.warnedUser"),
      target: t("admin.logs.sampleUser"),
      time: "2026-02-06T09:00:00Z",
      details: t("admin.logs.repeatSpam"),
    },
  ])

  const openCount = allReports.filter((r) => r.status === "open").length
  const inProgressCount = allReports.filter((r) => r.status === "in_progress").length
  const closedCount = allReports.filter((r) => r.status === "closed").length
  const totalComments = 5

  const handleStatusChange = (reportId: string, newStatus: string) => {
    toast.success(t("admin.toast.statusUpdated", { status: t(`status.${newStatus as ReportStatus}`) }))
  }

  const handleHideReport = (reportId: string) => {
    toast.success(t("admin.toast.reportHidden"))
  }

  const handleLockComments = (reportId: string) => {
    toast.success(t("admin.toast.commentsLocked"))
  }

  const handleWarnUser = (userId: string) => {
    toast.success(t("admin.toast.warningSent"))
  }

  const handleBanUser = (userId: string) => {
    toast.success(t("admin.toast.userBanned"))
  }

  const handleUnbanUser = (userId: string) => {
    toast.success(t("admin.toast.userUnbanned"))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">{t("admin.title")}</h1>
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
              <p className="text-xs text-muted-foreground">{t("admin.stats.totalReports")}</p>
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
              <p className="text-xs text-muted-foreground">{t("admin.stats.openIssues")}</p>
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
              <p className="text-xs text-muted-foreground">{t("admin.stats.totalUsers")}</p>
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
              <p className="text-xs text-muted-foreground">{t("admin.stats.comments")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="reports">
        <TabsList className="w-full flex-wrap h-auto">
          <TabsTrigger value="reports" className="gap-1">
            <FileText className="h-3.5 w-3.5" />
            {t("admin.tabs.reports")}
          </TabsTrigger>
          <TabsTrigger value="flagged" className="gap-1">
            <Flag className="h-3.5 w-3.5" />
            {t("admin.tabs.flagged")}
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1">
            <Users className="h-3.5 w-3.5" />
            {t("admin.tabs.users")}
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1">
            <ClipboardList className="h-3.5 w-3.5" />
            {t("admin.tabs.audit")}
          </TabsTrigger>
        </TabsList>

        {/* Reports Management */}
        <TabsContent value="reports" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t("admin.reports.allReports")}</CardTitle>
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
                          {(REPORT_STATUSES as ReportStatus[])
                            .filter((s) => s !== "draft")
                            .map((s) => (
                              <SelectItem key={s} value={s}>
                                {t(`status.${s}`)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleHideReport(report.id)}
                        title={t("admin.actions.toggleVisibility")}
                      >
                        {report.isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleLockComments(report.id)}
                        title={t("admin.actions.toggleComments")}
                      >
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
              <CardTitle className="text-sm">{t("admin.flagged.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {flaggedReports.length === 0 ? (
                <div className="py-8 text-center">
                  <Flag className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">{t("admin.flagged.empty")}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {flaggedReports.map((report) => (
                    <div key={report.id} className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{report.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("admin.flagged.flags", { count: report.flagCount })}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        {t("admin.flagged.dismiss")}
                      </Button>
                      <Button variant="destructive" size="sm" className="text-xs">
                        {t("admin.flagged.hide")}
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
              <CardTitle className="text-sm">{t("admin.users.title")}</CardTitle>
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
                            {t("admin.users.admin")}
                          </Badge>
                        )}
                        {u.isBanned && (
                          <Badge variant="destructive" className="text-xs">
                            {t("admin.users.banned")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {formatPoints(u.points)} {t("common.pointsShort")}
                        </span>
                        <span>{t("admin.users.warnings", { count: u.warnings })}</span>
                        <span>{t("admin.users.badges", { count: u.badges.length })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!u.isAdmin && (
                        <>
                          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs bg-transparent" onClick={() => handleWarnUser(u.id)}>
                            <AlertTriangle className="h-3 w-3" />
                            {t("admin.users.warn")}
                          </Button>
                          {u.isBanned ? (
                            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs bg-transparent" onClick={() => handleUnbanUser(u.id)}>
                              <UserCheck className="h-3 w-3" />
                              {t("admin.users.unban")}
                            </Button>
                          ) : (
                            <Button variant="destructive" size="sm" className="h-7 gap-1 text-xs" onClick={() => handleBanUser(u.id)}>
                              <Ban className="h-3 w-3" />
                              {t("admin.users.ban")}
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
              <CardTitle className="text-sm">{t("admin.audit.title")}</CardTitle>
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
