import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppShell } from "@/components/app-shell"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "ReporterMY - Community Problem Reporter",
  description: "Report and track local issues in your Malaysian community. Potholes, streetlights, garbage and more.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ReporterMY",
  },
}

export const viewport: Viewport = {
  themeColor: "#CC0001",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppShell>{children}</AppShell>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
