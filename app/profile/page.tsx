"use client"

import { useStore } from "@/lib/store"
import { BoringAvatar } from "@/components/boring-avatar"
import { ReportCard } from "@/components/report-card"
import { formatPoints } from "@/lib/helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Trophy, FileText, Eye, LogOut, Target, Handshake, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { fetchReports } from "@/lib/pocketbase-data"
import type { Report } from "@/lib/types"
import pb from "@/lib/pocketbase"

export default function ProfilePage() {
  const { user, setUser, logout } = useStore()
  const t = useTranslations()
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .catch(() => setReports([]))
  }, [])

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="text-lg font-medium text-foreground">{t("auth.pleaseSignIn")}</p>
      </div>
    )
  }

  const myReports = reports.filter((r) => r.createdBy === user.id)
  const followedReports = reports.filter((r) => r.followers.includes(user.id) && r.createdBy !== user.id)

  const badgeInfo = {
    pemula: {
      name: t("badges.pemula.name"),
      description: t("badges.pemula.description"),
      icon: Target,
      colors: "bg-primary/10 text-primary border-primary/20",
    },
    penolong: {
      name: t("badges.penolong.name"),
      description: t("badges.penolong.description"),
      icon: Handshake,
      colors: "bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20",
    },
    penyelesai: {
      name: t("badges.penyelesai.name"),
      description: t("badges.penyelesai.description"),
      icon: Star,
      colors: "bg-secondary/20 text-foreground border-secondary/30",
    },
  }

  const handleTogglePublic = async () => {
    const nextValue = !user.isPublic
    setUser({ ...user, isPublic: nextValue })
    try {
      await pb.collection("users").update(user.id, { isPublic: nextValue })
      toast.success(nextValue ? t("profile.publicToast") : t("profile.privateToast"))
    } catch (error) {
      setUser({ ...user, isPublic: user.isPublic })
      toast.error("Gagal. Sila cuba lagi.")
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Profile header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <BoringAvatar seed={user.avatarSeed} size={80} />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("profile.joined")}{" "}
                {new Date(user.created).toLocaleDateString("ms-MY", { month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{formatPoints(user.points)}</div>
              <div className="text-xs text-muted-foreground">{t("common.points")}</div>
            </div>
          </div>

          {/* Badges */}
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-foreground">{t("profile.badges")}</h3>
            <div className="flex flex-wrap gap-2">
              {user.badges.length > 0 ? (
                user.badges.map((badge) => {
                  const info = badgeInfo[badge as keyof typeof badgeInfo]
                  if (!info) return null
                  const Icon = info.icon
                  return (
                    <div
                      key={badge}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${info.colors}`}
                    >
                      <Icon className="h-4 w-4" />
                      <div>
                        <p className="text-xs font-semibold">{info.name}</p>
                        <p className="text-[10px] opacity-75">{info.description}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-muted-foreground">{t("profile.noBadges")}</p>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Switch id="public" checked={user.isPublic} onCheckedChange={handleTogglePublic} />
              <Label htmlFor="public" className="flex items-center gap-1 text-sm">
                <Eye className="h-3.5 w-3.5" />
                {t("profile.publicProfile")}
              </Label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                pb.authStore.clear()
                logout()
                toast.success(t("auth.loggedOut"))
              }}
              className="gap-1.5 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              {t("actions.signOut")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <FileText className="h-5 w-5 text-primary" />
            <span className="mt-1 text-2xl font-bold text-foreground">{myReports.length}</span>
            <span className="text-xs text-muted-foreground">{t("profile.reports")}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Eye className="h-5 w-5 text-status-in-progress" />
            <span className="mt-1 text-2xl font-bold text-foreground">{followedReports.length}</span>
            <span className="text-xs text-muted-foreground">{t("profile.following")}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Trophy className="h-5 w-5 text-secondary" />
            <span className="mt-1 text-2xl font-bold text-foreground">{user.badges.length}</span>
            <span className="text-xs text-muted-foreground">{t("profile.badges")}</span>
          </CardContent>
        </Card>
      </div>

      {/* Reports tabs */}
      <Tabs defaultValue="my-reports">
        <TabsList className="w-full">
          <TabsTrigger value="my-reports" className="flex-1">
            {t("profile.myReports", { count: myReports.length })}
          </TabsTrigger>
          <TabsTrigger value="following" className="flex-1">
            {t("profile.followedReports", { count: followedReports.length })}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="my-reports" className="mt-4">
          {myReports.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t("profile.noReports")}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {myReports.map((r) => (
                <ReportCard key={r.id} report={r} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="following" className="mt-4">
          {followedReports.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t("profile.noFollowing")}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {followedReports.map((r) => (
                <ReportCard key={r.id} report={r} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
