"use client"

import { useEffect, useRef } from "react"

export function ReportMap({ lat, lng }: { lat: number; lng: number }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamically load Leaflet
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(link)

    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.onload = () => {
      const L = (window as Record<string, unknown>).L as {
        map: (el: HTMLElement, opts: Record<string, unknown>) => {
          setView: (latlng: [number, number], zoom: number) => unknown
          invalidateSize: () => void
        }
        tileLayer: (url: string, opts: Record<string, unknown>) => { addTo: (map: unknown) => void }
        marker: (latlng: [number, number]) => { addTo: (map: unknown) => void }
      }
      if (!L || !mapRef.current) return

      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      }).setView([lat, lng], 15)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map)

      L.marker([lat, lng]).addTo(map)

      mapInstanceRef.current = map

      setTimeout(() => {
        ;(map as { invalidateSize: () => void }).invalidateSize()
      }, 100)
    }
    document.head.appendChild(script)

    return () => {
      if (mapInstanceRef.current) {
        ;(mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  }, [lat, lng])

  return <div ref={mapRef} className="h-full w-full" />
}
