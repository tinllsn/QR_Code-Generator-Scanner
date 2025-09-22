import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "QR Code Generator & Scanner",
  description:
    "Generate and scan QR codes with offline support. Create custom QR codes, scan with camera, and manage your history.",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["QR code", "generator", "scanner", "offline", "PWA"],
  authors: [{ name: "QR Code App" }],
  creator: "QR Code App",
  publisher: "QR Code App",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/icon-192.jpg",
    apple: "/icon-192.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QR Code App",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
