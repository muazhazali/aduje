import React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppShell } from "@/components/app-shell"
import { Toaster } from "sonner"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const metadata: Metadata = {
  title: {
    default: "AduJe - Pelapor Isu Komuniti",
    template: "%s | AduJe",
  },
  description:
    "Laporkan dan jejak isu setempat di komuniti anda. Lubang jalan, lampu jalan, sampah sarap dan banyak lagi.",
  applicationName: "AduJe",
  keywords: [
    "lapor isu komuniti",
    "pelapor isu",
    "pothole",
    "lampu jalan",
    "sampah sarap",
    "jalan raya",
    "kemudahan awam",
    "Malaysia",
    "PWA",
  ],
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "AduJe - Pelapor Isu Komuniti",
    description:
      "Laporkan dan jejak isu setempat di komuniti anda. Lubang jalan, lampu jalan, sampah sarap dan banyak lagi.",
    url: appUrl,
    siteName: "AduJe",
    locale: "ms_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AduJe - Pelapor Isu Komuniti",
    description:
      "Laporkan dan jejak isu setempat di komuniti anda. Lubang jalan, lampu jalan, sampah sarap dan banyak lagi.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AduJe",
  },
}

export const viewport: Viewport = {
  themeColor: "#CC0001",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
        <Toaster position="top-center" richColors />
        <Script
          defer
          src="https://umami.muaz.app/script.js"
          data-website-id="4063230e-bfbd-46c7-abfb-9b84c3944c7a"
        />
      </body>
    </html>
  )
}
