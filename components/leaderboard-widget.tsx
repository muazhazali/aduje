"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BoringAvatar } from "./boring-avatar"
import { formatPoints } from "@/lib/helpers"
import { LEADERBOARD_USERS } from "@/lib/mock-data"
import { Trophy } from "lucide-react"

export function LeaderboardWidget() {
  const top5 = LEADERBOARD_USERS.slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Trophy className="h-4 w-4 text-secondary" />
          Top Community Members
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex flex-col gap-2.5">
          {top5.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <span className="w-5 text-center text-xs font-bold text-muted-foreground">
                {user.rank}
              </span>
              <BoringAvatar seed={user.avatarSeed} size={28} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              </div>
              <span className="text-xs font-semibold text-primary">{formatPoints(user.points)} pts</span>
            </div>
          ))}
        </div>
        <Link
          href="/leaderboard"
          className="mt-3 block text-center text-xs font-medium text-primary hover:underline"
        >
          View Full Leaderboard
        </Link>
      </CardContent>
    </Card>
  )
}
