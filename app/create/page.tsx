"use client"

import React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { REPORT_CATEGORIES, type ReportCategory } from "@/lib/types"
import { getDistanceKm } from "@/lib/helpers"
import { useStore } from "@/lib/store"
import { StatusBadge } from "@/components/status-badge"
import { MapPin, Upload, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, Loader2, Navigation } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { fetchReportById, fetchReports } from "@/lib/pocketbase-data"
import type { Report } from "@/lib/types"
import pb from "@/lib/pocketbase"

export default function CreateReportPage() {
  const router = useRouter()
  const { user, addReport } = useStore()
  const [step, setStep] = useState(0)
  const t = useTranslations()
  const [reports, setReports] = useState<Report[]>([])

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
  const [duplicates, setDuplicates] = useState<Report[]>([])
  const [submitting, setSubmitting] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const markerRef = useRef<unknown>(null)

  // Auto-detect location
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error(t("create.geoNotSupported"))
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        setLocating(false)
        toast.success(t("create.locationDetected"))
      },
      () => {
        setLocating(false)
        toast.error(t("create.locationFailed"))
      },
      { enableHighAccuracy: true },
    )
  }, [t])

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

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .catch(() => setReports([]))
  }, [])

  // Duplicate check
  useEffect(() => {
    if (step === 3 && category) {
      const nearby = reports.filter(
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
      toast.error(t("create.maxPhotos"))
      return
    }
    const newFiles = files.filter((f) => f.size <= 5 * 1024 * 1024)
    if (newFiles.length < files.length) {
      toast.error(t("create.photoTooLarge"))
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

  const handleSubmit = async () => {
    if (!user) {
      toast.error(t("auth.pleaseSignIn"))
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        title,
        description,
        category: category as ReportCategory,
        latitude,
        longitude,
        address,
        landmark,
        status: "open",
        createdBy: user.id,
        followers: [user.id],
        upvotes: [],
        upvoteCount: 0,
        confirmations: [],
        confirmationCount: 0,
        flagCount: 0,
        flaggedBy: [],
        isHidden: false,
        commentsLocked: false,
      } as Record<string, any>

      if (photoFiles.length > 0) {
        payload.photos = photoFiles
      }

      const created = await pb.collection("reports").create(payload)
      const hydrated = await fetchReportById(created.id)
      addReport(hydrated)
      setSubmitting(false)
      toast.success(t("create.submitted"))
      router.push("/")
    } catch (error) {
      setSubmitting(false)
      toast.error("Gagal. Sila cuba lagi.")
    }
  }

  const steps = [t("create.steps.basic"), t("create.steps.photos"), t("create.steps.location"), t("create.steps.review")]

  return (
    <div className="mx-auto max-w-2xl px-4 py-4">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-3 gap-1.5 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        {t("actions.back")}
      </Button>

      <h1 className="mb-4 text-xl font-bold text-foreground">{t("create.title")}</h1>

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={4}>
        {steps.map((s, i) => (
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
            <CardTitle className="text-base">{t("create.basicInfoTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-foreground">
                {t("create.fields.title")} *
              </label>
              <Input
                id="title"
                placeholder={t("create.placeholders.title")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
              <p className="mt-1 text-xs text-muted-foreground">{title.length}/100</p>
            </div>
            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-foreground">
                {t("create.fields.description")} *
              </label>
              <Textarea
                id="description"
                placeholder={t("create.placeholders.description")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                className="min-h-[120px]"
              />
              <p className="mt-1 text-xs text-muted-foreground">{description.length}/1000</p>
            </div>
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-foreground">
                {t("create.fields.category")} *
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder={t("create.placeholders.category")} />
                </SelectTrigger>
                <SelectContent>
                  {(REPORT_CATEGORIES as ReportCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {t(`categories.${cat}`)}
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
            <CardTitle className="text-base">{t("create.photosTitle")}</CardTitle>
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
                  <span className="mt-1 text-xs">{t("actions.add")}</span>
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
            <p className="text-xs text-muted-foreground">{t("create.photosHint")}</p>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("create.locationTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button variant="outline" size="sm" onClick={detectLocation} disabled={locating} className="w-fit gap-1.5 bg-transparent">
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              {locating ? t("create.detecting") : t("create.autoDetect")}
            </Button>

            <div className="h-56 overflow-hidden rounded-lg border border-border">
              <div ref={mapRef} className="h-full w-full" />
            </div>
            <p className="text-xs text-muted-foreground">
              <MapPin className="mr-1 inline h-3 w-3" />
              {t("create.locationHint", { lat: latitude.toFixed(4), lng: longitude.toFixed(4) })}
            </p>

            <div>
              <label htmlFor="address" className="mb-1 block text-sm font-medium text-foreground">
                {t("create.fields.address")}
              </label>
              <Input
                id="address"
                placeholder={t("create.placeholders.address")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="landmark" className="mb-1 block text-sm font-medium text-foreground">
                {t("create.fields.landmark")}
              </label>
              <Input
                id="landmark"
                placeholder={t("create.placeholders.landmark")}
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
                  <span className="text-sm font-semibold text-foreground">{t("create.duplicatesTitle")}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {duplicates.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-md border border-border p-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{d.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StatusBadge status={d.status} />
                          <span className="text-xs text-muted-foreground">
                            {t("create.kmAway", { distance: getDistanceKm(latitude, longitude, d.latitude, d.longitude).toFixed(1) })}
                          </span>
                        </div>
                      </div>
                      <Link href={`/report/${d.id}`}>
                        <Button variant="outline" size="sm" className="text-xs bg-transparent">
                          {t("actions.view")}
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
              <CardTitle className="text-base">{t("create.reviewTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <span className="text-xs font-medium text-muted-foreground">{t("create.fields.title")}</span>
                <p className="text-sm font-medium text-foreground">{title}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">{t("create.fields.description")}</span>
                <p className="text-sm text-foreground">{description}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">{t("create.fields.category")}</span>
                <p className="text-sm text-foreground">{category && t(`categories.${category as ReportCategory}`)}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">{t("create.fields.photos")}</span>
                <p className="text-sm text-foreground">{t("create.photoCount", { count: photoFiles.length })}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">{t("create.fields.location")}</span>
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
          {t("actions.previous")}
        </Button>

        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
            {t("actions.next")}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1.5 h-4 w-4" />}
            {t("create.submit")}
          </Button>
        )}
      </div>
    </div>
  )
}
