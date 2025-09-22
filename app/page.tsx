"use client"

import { useState, useEffect } from "react"
import { QrCode, Camera, History, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import QRGenerator from "@/components/qr-generator"
import QRScanner from "@/components/qr-scanner"
import QRHistory from "@/components/qr-history"
import QRSettings from "@/components/qr-settings"
import OfflineIndicator from "@/components/offline-indicator"

type TabType = "generate" | "scan" | "history" | "settings"

export default function QRCodeApp() {
  const [activeTab, setActiveTab] = useState<TabType>("generate")

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration)
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })
    }
  }, [])

  const tabs = [
    { id: "generate" as TabType, label: "Generate", icon: QrCode },
    { id: "scan" as TabType, label: "Scan", icon: Camera },
    { id: "history" as TabType, label: "History", icon: History },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "generate":
        return <QRGenerator />
      case "scan":
        return <QRScanner />
      case "history":
        return <QRHistory />
      case "settings":
        return <QRSettings />
      default:
        return <QRGenerator />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />

      <div className="container mx-auto max-w-4xl p-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">QR Code Generator & Scanner</h1>
          <p className="text-muted-foreground">Create, scan, and manage QR codes with offline support</p>
        </header>

        {/* Navigation Tabs */}
        <Card className="mb-6">
          <div className="flex flex-wrap justify-center gap-2 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              )
            })}
          </div>
        </Card>

        {/* Main Content */}
        <div className="min-h-[600px]">{renderContent()}</div>
      </div>
    </div>
  )
}
