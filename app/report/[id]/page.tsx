"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { MOCK_REPORTS, MOCK_COMMENTS } from "@/lib/mock-data"
import { useStore } from "@/lib/store"
import { StatusBadge } from "@/components/status-badge"
import { CategoryBadge } from "@/components/category-badge"
import { BoringAvatar } from "@/components/boring-avatar"
import { formatRelativeTime, formatPoints } from "@/lib/helpers"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  ThumbsUp,
  Heart,
  Flame,
  UserPlus,
  UserMinus,
  Share2,
  MapPin,
  ArrowLeft,
  MessageCircle,
  Send,
  Navigation,
  Flag,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { toast } from "sonner"
import { ReportMap } from "@/components/report-map"

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useStore()
  const report = MOCK_REPORTS.find((r) => r.id === id)
  const comments = MOCK_COMMENTS.filter((c) => c.reportId === id && !c.parentId)
  const allComments = MOCK_COMMENTS.filter((c) => c.reportId === id)

  const [isFollowing, setIsFollowing] = useState(() => report?.followers.includes(user?.id || "") ?? false)
  const [hasUpvoted, setHasUpvoted] = useState(() => report?.upvotes.includes(user?.id || "") ?? false)
  const [upvoteCount, setUpvoteCount] = useState(report?.upvoteCount ?? 0)
  const [commentText, setCommentText] = useState("")
  const [showAllComments, setShowAllComments] = useState(false)

  if (!report) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="text-lg font-medium text-foreground">Report not found</p>
        <Button variant="ghost" onClick={() => router.push("/")} className="mt-2">
          Go back to feed
        </Button>
      </div>
    )
  }

  const creator = report.expand?.createdBy

  const handleUpvote = () => {
    setHasUpvoted(!hasUpvoted)
    setUpvoteCount((c) => (hasUpvoted ? c - 1 : c + 1))
    toast.success(hasUpvoted ? "Upvote removed" : "Report upvoted!")
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    toast.success(isFollowing ? "Unfollowed report" : "Following report!")
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/report/${report.id}`
    if (navigator.share) {
      await navigator.share({ title: report.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard!")
    }
  }

  const handleComment = () => {
    if (!commentText.trim()) return
    toast.success("Comment posted!")
    setCommentText("")
  }

  const handleFlag = () => {
    toast.success("Report flagged. Thank you for helping keep the community safe.")
  }

  const displayedComments = showAllComments ? comments : comments.slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl px-4 py-4">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-3 gap-1.5 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <StatusBadge status={report.status} className="text-sm" />
          <CategoryBadge category={report.category} />
        </div>
        <h1 className="text-xl font-bold text-balance text-foreground sm:text-2xl">{report.title}</h1>
        <div className="mt-2 flex items-center gap-2">
          {creator && (
            <>
              <BoringAvatar seed={creator.avatarSeed} size={24} />
              <span className="text-sm font-medium text-foreground">{creator.name}</span>
              <span className="text-xs text-muted-foreground">{formatPoints(creator.points)} pts</span>
            </>
          )}
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(report.created)}
          </span>
        </div>
      </div>

      {/* Description */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{report.description}</p>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Location
          </h2>
          {report.address && <p className="mb-1 text-sm text-muted-foreground">{report.address}</p>}
          {report.landmark && <p className="mb-3 text-xs text-muted-foreground">{report.landmark}</p>}

          <div className="h-48 overflow-hidden rounded-lg border border-border">
            <ReportMap lat={report.latitude} lng={report.longitude} />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
            </span>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Navigation className="h-3 w-3" />
              Get Directions
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Engagement */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          variant={hasUpvoted ? "default" : "outline"}
          size="sm"
          onClick={handleUpvote}
          className="gap-1.5"
        >
          <ThumbsUp className="h-4 w-4" />
          Upvote ({upvoteCount})
        </Button>
        <Button
          variant={isFollowing ? "default" : "outline"}
          size="sm"
          onClick={handleFollow}
          className="gap-1.5"
        >
          {isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {isFollowing ? "Following" : "Follow"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 bg-transparent">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button variant="ghost" size="sm" onClick={handleFlag} className="gap-1.5 text-muted-foreground">
          <Flag className="h-4 w-4" />
          Flag
        </Button>
      </div>

      {/* Comments */}
      <Card>
        <CardContent className="p-4">
          <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <MessageCircle className="h-4 w-4 text-primary" />
            Comments ({allComments.length})
          </h2>

          {/* Comment input */}
          {!report.commentsLocked ? (
            <div className="mb-4 flex gap-2">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[60px] text-sm"
                maxLength={500}
              />
              <Button size="icon" onClick={handleComment} disabled={!commentText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="mb-4 rounded-md bg-muted p-3 text-center text-xs text-muted-foreground">
              Comments are locked on this report.
            </p>
          )}

          {/* Comment list */}
          <div className="flex flex-col gap-4">
            {displayedComments.map((comment) => {
              const commentUser = comment.expand?.userId
              const replies = allComments.filter((c) => c.parentId === comment.id)

              return (
                <div key={comment.id} className="flex gap-3">
                  {commentUser && <BoringAvatar seed={commentUser.avatarSeed} size={32} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{commentUser?.name}</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.created)}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-foreground">{comment.content}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        {comment.reactions.like.length}
                      </button>
                      <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        <Heart className="h-3 w-3" />
                        {comment.reactions.support.length}
                      </button>
                      <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        <Flame className="h-3 w-3" />
                        {comment.reactions.urgent.length}
                      </button>
                    </div>

                    {/* Replies */}
                    {replies.map((reply) => {
                      const replyUser = reply.expand?.userId
                      return (
                        <div key={reply.id} className="mt-3 flex gap-2 border-l-2 border-border pl-3">
                          {replyUser && <BoringAvatar seed={replyUser.avatarSeed} size={24} />}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-foreground">{replyUser?.name}</span>
                              <span className="text-xs text-muted-foreground">{formatRelativeTime(reply.created)}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-foreground">{reply.content}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {comments.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllComments(!showAllComments)}
              className="mt-3 w-full gap-1 text-xs"
            >
              {showAllComments ? (
                <>
                  Show less <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Show all {comments.length} comments <ChevronDown className="h-3 w-3" />
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
