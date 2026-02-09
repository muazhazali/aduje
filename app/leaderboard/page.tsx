"use client"

import React from "react"

import { BoringAvatar } from "@/components/boring-avatar"
import { formatPoints } from "@/lib/helpers"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Award, Target, Handshake, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { fetchLeaderboardUsers, type LeaderboardUser } from "@/lib/pocketbase-data"

const BADGE_ICONS: Record<string, React.ElementType> = {
  pemula: Target,
  penolong: Handshake,
  penyelesai: Star,
}

const PODIUM_STYLES = [
  "bg-secondary/20 border-secondary/40",
  "bg-muted/80 border-border",
  "bg-primary/5 border-primary/10",
]

const RANK_ICONS = [Trophy, Medal, Award]

export default function LeaderboardPage() {
  const { user } = useStore()
  const t = useTranslations()
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([])

  useEffect(() => {
    fetchLeaderboardUsers()
      .then(setLeaderboardUsers)
      .catch(() => setLeaderboardUsers([]))
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-foreground flex items-center gap-2">
        <Trophy className="h-6 w-6 text-secondary" />
        {t("leaderboard.title")}
      </h1>

      <Tabs defaultValue="all-time">
        <TabsList>
          <TabsTrigger value="all-time">{t("leaderboard.allTime")}</TabsTrigger>
          <TabsTrigger value="monthly">{t("leaderboard.thisMonth")}</TabsTrigger>
          <TabsTrigger value="weekly">{t("leaderboard.thisWeek")}</TabsTrigger>
        </TabsList>

        <TabsContent value="all-time" className="mt-4">
          {/* Top 3 podium */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            {leaderboardUsers.slice(0, 3).map((u, i) => {
              const RankIcon = RANK_ICONS[i]
              return (
                <Card key={u.id} className={cn("text-center", i === 0 && "order-2", i === 1 && "order-1", i === 2 && "order-3")}>
                  <CardContent className={cn("p-4 rounded-lg border", PODIUM_STYLES[i])}>
                    <RankIcon className={cn("mx-auto h-5 w-5 mb-2", i === 0 ? "text-secondary" : "text-muted-foreground")} />
                    <div className="flex justify-center">
                      <BoringAvatar seed={u.avatarSeed} size={i === 0 ? 56 : 44} />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground truncate">{u.name}</p>
                    <p className="text-lg font-bold text-primary">{formatPoints(u.points)}</p>
                    <p className="text-xs text-muted-foreground">{t("common.points")}</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      {u.badges.map((b) => {
                        const Icon = BADGE_ICONS[b]
                        return Icon ? <Icon key={b} className="h-3.5 w-3.5 text-muted-foreground" /> : null
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Full list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{t("leaderboard.allRankings")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                {leaderboardUsers.map((u) => {
                  const isCurrentUser = u.id === user?.id
                  return (
                    <div
                      key={u.id}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5",
                        isCurrentUser && "bg-primary/5",
                      )}
                    >
                      <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                        {u.rank}
                      </span>
                      <BoringAvatar seed={u.avatarSeed} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm truncate", isCurrentUser ? "font-bold text-primary" : "font-medium text-foreground")}>
                          {u.name}
                          {isCurrentUser && <span className="ml-1 text-xs">({t("leaderboard.you")})</span>}
                        </p>
                        <div className="flex items-center gap-1">
                          {u.badges.map((b) => {
                            const Icon = BADGE_ICONS[b]
                            return Icon ? <Icon key={b} className="h-3 w-3 text-muted-foreground" /> : null
                          })}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {formatPoints(u.points)} {t("common.pointsShort")}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <p className="py-12 text-center text-sm text-muted-foreground">{t("leaderboard.monthlySoon")}</p>
        </TabsContent>
        <TabsContent value="weekly" className="mt-4">
          <p className="py-12 text-center text-sm text-muted-foreground">{t("leaderboard.weeklySoon")}</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
