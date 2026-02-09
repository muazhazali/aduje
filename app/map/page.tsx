"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { MOCK_REPORTS } from "@/lib/mock-data"
import { REPORT_STATUSES, type ReportCategory, type ReportStatus } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { List } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

const STATUS_MARKER_COLORS: Record<ReportStatus, string> = {
  draft: "#6B7280",
  open: "#EF4444",
  acknowledged: "#F59E0B",
  in_progress: "#3B82F6",
  closed: "#10B981",
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const [loaded, setLoaded] = useState(false)
  const t = useTranslations()

  const getCategoryLabel = useCallback((category: ReportCategory) => t(`categories.${category}`), [t])
  const getStatusLabel = useCallback((status: ReportStatus) => t(`status.${status}`), [t])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

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

      const map = L.map(mapRef.current, {
        zoomControl: true,
      }).setView([3.139, 101.6869], 12)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map)

      const reports = MOCK_REPORTS.filter((r) => r.status !== "draft" && !r.isHidden)

      for (const report of reports) {
        const color = STATUS_MARKER_COLORS[report.status]
        const categoryLabel = getCategoryLabel(report.category)
        const statusLabel = getStatusLabel(report.status)
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        L.marker([report.latitude, report.longitude], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width:200px">
              <strong style="font-size:13px">${report.title}</strong><br/>
              <span style="font-size:11px;color:#666">${categoryLabel}</span><br/>
              <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;color:white;background:${color};margin-top:4px">${statusLabel}</span><br/>
              <a href="/report/${report.id}" style="font-size:11px;color:#CC0001;margin-top:6px;display:inline-block">${t("map.viewDetails")} &rarr;</a>
            </div>`,
          )
      }

      mapInstanceRef.current = map
      setLoaded(true)

      setTimeout(() => map.invalidateSize(), 100)
    }
    document.head.appendChild(script)

    return () => {
      if (mapInstanceRef.current) {
        // biome-ignore lint: dynamic typing
        ;(mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
      }
    }
  }, [getCategoryLabel, getStatusLabel, t])

  return (
    <div className="relative" style={{ height: "calc(100vh - 3.5rem - 4rem)" }}>
      <div ref={mapRef} className="h-full w-full" />

      {/* List toggle */}
      <div className="absolute right-4 top-4 z-10">
        <Link href="/">
          <Button size="sm" className="gap-1.5 shadow-md">
            <List className="h-4 w-4" />
            {t("map.listView")}
          </Button>
        </Link>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-card p-3 shadow-md">
        <p className="mb-1.5 text-xs font-semibold text-foreground">{t("map.statusLegend")}</p>
        <div className="flex flex-col gap-1">
          {(REPORT_STATUSES as ReportStatus[]).filter((status) => status !== "draft").map((status) => (
            <div key={status} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: STATUS_MARKER_COLORS[status] }}
              />
              <span className="text-xs text-muted-foreground">{getStatusLabel(status)}</span>
            </div>
          ))}
        </div>
      </div>

      {!loaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-muted">
          <p className="text-sm text-muted-foreground">{t("map.loading")}</p>
        </div>
      )}
    </div>
  )
}
