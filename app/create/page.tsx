"use client"

import React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CATEGORY_LABELS, type ReportCategory } from "@/lib/types"
import { MOCK_REPORTS } from "@/lib/mock-data"
import { getDistanceKm, generateId } from "@/lib/helpers"
import { useStore } from "@/lib/store"
import { StatusBadge } from "@/components/status-badge"
import { MapPin, Upload, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, Loader2, Navigation } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const STEPS = ["Basic Info", "Photos", "Location", "Review"]

export default function CreateReportPage() {
  const router = useRouter()
  const { user, addReport } = useStore()
  const [step, setStep] = useState(0)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<string>("")
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [latitude, setLatitude] = useState(3.139)
  const [longitude, setLongitude] = useState(101.6869)
  const [address, setAddress] = useState("")
  const [landmark, setLandmark] = useState("")
  const [locating, setLocating] = useState(false)
  const [duplicates, setDuplicates] = useState<typeof MOCK_REPORTS>([])
  const [submitting, setSubmitting] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const markerRef = useRef<unknown>(null)

  // Auto-detect location
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        setLocating(false)
        toast.success("Location detected!")
      },
      () => {
        setLocating(false)
        toast.error("Unable to get location. Using default KL location.")
      },
      { enableHighAccuracy: true },
    )
  }, [])

  // Init map on step 2
  useEffect(() => {
    if (step !== 2 || !mapRef.current || mapInstanceRef.current) return

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(link)

    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.onload = () => {
      // biome-ignore lint: dynamic typing for Leaflet
      const L = (window as any).L
      if (!L || !mapRef.current) return

      const map = L.map(mapRef.current).setView([latitude, longitude], 15)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map)

      const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map)
      marker.on("dragend", () => {
        const latlng = marker.getLatLng()
        setLatitude(latlng.lat)
        setLongitude(latlng.lng)
      })

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng(e.latlng)
        setLatitude(e.latlng.lat)
        setLongitude(e.latlng.lng)
      })

      mapInstanceRef.current = map
      markerRef.current = marker

      setTimeout(() => map.invalidateSize(), 100)
    }
    document.head.appendChild(script)

    return () => {
      if (mapInstanceRef.current) {
        // biome-ignore lint: dynamic
        ;(mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [step, latitude, longitude])

  // Duplicate check
  useEffect(() => {
    if (step === 3 && category) {
      const nearby = MOCK_REPORTS.filter(
        (r) =>
          r.status !== "draft" &&
          r.category === category &&
          getDistanceKm(latitude, longitude, r.latitude, r.longitude) < 0.5,
      )
      setDuplicates(nearby)
    }
  }, [step, category, latitude, longitude])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (photoFiles.length + files.length > 5) {
      toast.error("Maximum 5 photos allowed")
      return
    }
    const newFiles = files.filter((f) => f.size <= 5 * 1024 * 1024)
    if (newFiles.length < files.length) {
      toast.error("Some files were too large (max 5MB)")
    }
    setPhotoFiles((prev) => [...prev, ...newFiles])
    for (const f of newFiles) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPhotoPreviews((prev) => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(f)
    }
  }

  const removePhoto = (idx: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  const canNext = () => {
    if (step === 0) return title.trim() && description.trim() && category
    if (step === 1) return true
    if (step === 2) return true
    return true
  }

  const handleSubmit = () => {
    setSubmitting(true)
    const newReport = {
      id: generateId(),
      title,
      description,
      category: category as ReportCategory,
      photos: photoPreviews,
      latitude,
      longitude,
      address,
      landmark,
      status: "open" as const,
      createdBy: user?.id || "user1",
      followers: [user?.id || "user1"],
      upvotes: [],
      upvoteCount: 0,
      confirmations: [],
      confirmationCount: 0,
      flagCount: 0,
      flaggedBy: [],
      isHidden: false,
      commentsLocked: false,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      expand: { createdBy: user || undefined },
    }

    setTimeout(() => {
      addReport(newReport)
      setSubmitting(false)
      toast.success("Report submitted! +10 points")
      router.push("/")
    }, 1000)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-3 gap-1.5 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <h1 className="mb-4 text-xl font-bold text-foreground">Create Report</h1>

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={4}>
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                i <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`hidden text-xs sm:inline ${i <= step ? "font-medium text-foreground" : "text-muted-foreground"}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-foreground">
                Title *
              </label>
              <Input
                id="title"
                placeholder="e.g. Lubang besar di Jalan Ampang"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
              <p className="mt-1 text-xs text-muted-foreground">{title.length}/100</p>
            </div>
            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-foreground">
                Description *
              </label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                className="min-h-[120px]"
              />
              <p className="mt-1 text-xs text-muted-foreground">{description.length}/1000</p>
            </div>
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-foreground">
                Category *
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABELS) as ReportCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Photos */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photos (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {photoPreviews.map((preview, idx) => (
                <div key={`preview-${idx}`} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                  <img src={preview || "/placeholder.svg"} alt={`Upload ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/80 text-xs text-background"
                    aria-label={`Remove photo ${idx + 1}`}
                  >
                    x
                  </button>
                </div>
              ))}
              {photoFiles.length < 5 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary">
                  <Upload className="h-5 w-5" />
                  <span className="mt-1 text-xs">Add</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Max 5 photos, 5MB each. JPEG, PNG or WebP.</p>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button variant="outline" size="sm" onClick={detectLocation} disabled={locating} className="w-fit gap-1.5 bg-transparent">
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              {locating ? "Detecting..." : "Auto-detect my location"}
            </Button>

            <div className="h-56 overflow-hidden rounded-lg border border-border">
              <div ref={mapRef} className="h-full w-full" />
            </div>
            <p className="text-xs text-muted-foreground">
              <MapPin className="mr-1 inline h-3 w-3" />
              Click or drag the marker to set the exact location. ({latitude.toFixed(4)}, {longitude.toFixed(4)})
            </p>

            <div>
              <label htmlFor="address" className="mb-1 block text-sm font-medium text-foreground">
                Address / Landmark
              </label>
              <Input
                id="address"
                placeholder="e.g. Jalan Ampang, near KLCC"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="landmark" className="mb-1 block text-sm font-medium text-foreground">
                Nearby Landmark
              </label>
              <Input
                id="landmark"
                placeholder="e.g. opposite Suria KLCC"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Duplicates */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          {duplicates.length > 0 && (
            <Card className="border-status-acknowledged">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-status-acknowledged" />
                  <span className="text-sm font-semibold text-foreground">Possible duplicates found nearby</span>
                </div>
                <div className="flex flex-col gap-2">
                  {duplicates.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-md border border-border p-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{d.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StatusBadge status={d.status} />
                          <span className="text-xs text-muted-foreground">
                            {getDistanceKm(latitude, longitude, d.latitude, d.longitude).toFixed(1)} km away
                          </span>
                        </div>
                      </div>
                      <Link href={`/report/${d.id}`}>
                        <Button variant="outline" size="sm" className="text-xs bg-transparent">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review Your Report</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Title</span>
                <p className="text-sm font-medium text-foreground">{title}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Description</span>
                <p className="text-sm text-foreground">{description}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Category</span>
                <p className="text-sm text-foreground">{category && CATEGORY_LABELS[category as ReportCategory]}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Photos</span>
                <p className="text-sm text-foreground">{photoFiles.length} photo(s)</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Location</span>
                <p className="text-sm text-foreground">{address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Previous
        </Button>

        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
            Next
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1.5 h-4 w-4" />}
            Submit Report
          </Button>
        )}
      </div>
    </div>
  )
}
