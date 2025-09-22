"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { HardDrive, Trash2, Download, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StorageInfo {
  used: number
  total: number
  percentage: number
}

export default function StorageManager() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ used: 0, total: 0, percentage: 0 })
  const [isSupported, setIsSupported] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkStorageSupport()
    calculateStorageUsage()
  }, [])

  const checkStorageSupport = () => {
    setIsSupported("storage" in navigator && "estimate" in navigator.storage)
  }

  const calculateStorageUsage = async () => {
    if (!isSupported) return

    try {
      const estimate = await navigator.storage.estimate()
      const used = estimate.usage || 0
      const total = estimate.quota || 0
      const percentage = total > 0 ? (used / total) * 100 : 0

      setStorageInfo({
        used,
        total,
        percentage,
      })
    } catch (error) {
      console.error("Failed to estimate storage:", error)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const clearAllData = () => {
    localStorage.clear()
    sessionStorage.clear()

    // Clear IndexedDB if used
    if ("indexedDB" in window) {
      indexedDB.databases?.().then((databases) => {
        databases.forEach((db) => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name)
          }
        })
      })
    }

    calculateStorageUsage()
    toast({
      title: "Storage Cleared",
      description: "All local data has been removed",
    })
  }

  const exportAllData = () => {
    const allData = {
      history: JSON.parse(localStorage.getItem("qr-history") || "[]"),
      settings: JSON.parse(localStorage.getItem("qr-settings") || "{}"),
      timestamp: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(allData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `qr-app-backup-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Data Exported",
      description: "All app data has been exported",
    })
  }

  const importAllData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)

        if (importedData.history) {
          localStorage.setItem("qr-history", JSON.stringify(importedData.history))
        }
        if (importedData.settings) {
          localStorage.setItem("qr-settings", JSON.stringify(importedData.settings))
        }

        calculateStorageUsage()
        toast({
          title: "Data Imported",
          description: "App data has been restored",
        })
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid backup file format",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Storage estimation is not supported in this browser.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Storage Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Storage Usage</span>
            <Badge variant={storageInfo.percentage > 80 ? "destructive" : "secondary"}>
              {storageInfo.percentage.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={storageInfo.percentage} className="mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatBytes(storageInfo.used)} used</span>
            <span>{formatBytes(storageInfo.total)} total</span>
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h4 className="text-sm font-medium mb-3">Data Management</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button onClick={exportAllData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
            <Button asChild variant="outline" size="sm">
              <label>
                <Upload className="h-4 w-4 mr-2" />
                Import All
                <input type="file" accept=".json" onChange={importAllData} className="hidden" />
              </label>
            </Button>
            <Button onClick={clearAllData} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Storage Details */}
        <div>
          <h4 className="text-sm font-medium mb-3">Storage Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">QR History:</span>
              <span>{JSON.parse(localStorage.getItem("qr-history") || "[]").length} items</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Settings:</span>
              <span>{Object.keys(JSON.parse(localStorage.getItem("qr-settings") || "{}")).length} keys</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cache Status:</span>
              <Badge variant="outline">Active</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
