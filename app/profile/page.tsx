"use client"

import { useStore } from "@/lib/store"
import { MOCK_REPORTS } from "@/lib/mock-data"
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

const BADGE_INFO = {
  pemula: {
    name: "Pemula",
    description: "Started making a difference in your community",
    icon: Target,
    colors: "bg-primary/10 text-primary border-primary/20",
  },
  penolong: {
    name: "Penolong",
    description: "Actively engaged in community discussions",
    icon: Handshake,
    colors: "bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20",
  },
  penyelesai: {
    name: "Penyelesai",
    description: "Got issues resolved for the community",
    icon: Star,
    colors: "bg-secondary/20 text-foreground border-secondary/30",
  },
}

export default function ProfilePage() {
  const { user, setUser, logout } = useStore()

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="text-lg font-medium text-foreground">Please sign in</p>
      </div>
    )
  }

  const myReports = MOCK_REPORTS.filter((r) => r.createdBy === user.id)
  const followedReports = MOCK_REPORTS.filter((r) => r.followers.includes(user.id) && r.createdBy !== user.id)

  const handleTogglePublic = () => {
    setUser({ ...user, isPublic: !user.isPublic })
    toast.success(user.isPublic ? "Profile set to private" : "Profile set to public")
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
                Joined {new Date(user.created).toLocaleDateString("en-MY", { month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{formatPoints(user.points)}</div>
              <div className="text-xs text-muted-foreground">points</div>
            </div>
          </div>

          {/* Badges */}
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {user.badges.length > 0 ? (
                user.badges.map((badge) => {
                  const info = BADGE_INFO[badge as keyof typeof BADGE_INFO]
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
                <p className="text-xs text-muted-foreground">No badges yet. Start reporting to earn badges!</p>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Switch id="public" checked={user.isPublic} onCheckedChange={handleTogglePublic} />
              <Label htmlFor="public" className="flex items-center gap-1 text-sm">
                <Eye className="h-3.5 w-3.5" />
                Public profile
              </Label>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { logout(); toast.success("Logged out") }} className="gap-1.5 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              Sign out
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
            <span className="text-xs text-muted-foreground">Reports</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Eye className="h-5 w-5 text-status-in-progress" />
            <span className="mt-1 text-2xl font-bold text-foreground">{followedReports.length}</span>
            <span className="text-xs text-muted-foreground">Following</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4">
            <Trophy className="h-5 w-5 text-secondary" />
            <span className="mt-1 text-2xl font-bold text-foreground">{user.badges.length}</span>
            <span className="text-xs text-muted-foreground">Badges</span>
          </CardContent>
        </Card>
      </div>

      {/* Reports tabs */}
      <Tabs defaultValue="my-reports">
        <TabsList className="w-full">
          <TabsTrigger value="my-reports" className="flex-1">
            My Reports ({myReports.length})
          </TabsTrigger>
          <TabsTrigger value="following" className="flex-1">
            Following ({followedReports.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="my-reports" className="mt-4">
          {myReports.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No reports yet</p>
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
            <p className="py-8 text-center text-sm text-muted-foreground">Not following any reports</p>
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
