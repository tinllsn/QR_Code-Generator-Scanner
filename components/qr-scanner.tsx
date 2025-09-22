"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, RotateCcw, Upload, ExternalLink, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRHistoryItem {
  id: string
  content: string
  type: "generated" | "scanned"
  timestamp: Date
  category: "text" | "url" | "email" | "phone" | "other"
}

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedResult, setScannedResult] = useState<string>("")
  const [scanMethod, setScanMethod] = useState<"camera" | "file">("camera")
  const [cameraType, setCameraType] = useState<"environment" | "user">("environment")
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const saveToHistory = (content: string) => {
    const savedSettings = localStorage.getItem("qr-settings")
    const settings = savedSettings ? JSON.parse(savedSettings) : { autoSave: true }

    if (!settings.autoSave) return

    const historyItem: QRHistoryItem = {
      id: Date.now().toString(),
      content,
      type: "scanned",
      timestamp: new Date(),
      category: detectCategory(content),
    }

    const existingHistory = localStorage.getItem("qr-history")
    const history = existingHistory ? JSON.parse(existingHistory) : []

    // Check if this content already exists to avoid duplicates
    const exists = history.some((item: QRHistoryItem) => item.content === content && item.type === "scanned")

    if (!exists) {
      history.unshift(historyItem)
      // Keep only the last 100 items
      if (history.length > 100) {
        history.splice(100)
      }
      localStorage.setItem("qr-history", JSON.stringify(history))
    }
  }

  const detectCategory = (content: string): "text" | "url" | "email" | "phone" | "other" => {
    if (content.match(/^https?:\/\//)) return "url"
    if (content.match(/^mailto:|@.*\./)) return "email"
    if (content.match(/^tel:|^\+?[\d\s\-$$$$]+$/)) return "phone"
    if (content.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) return "email"
    return "text"
  }

  const startCameraScanning = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear()
      } catch (error) {
        console.log("Error clearing previous scanner:", error)
      }
      scannerRef.current = null
    }

    setIsScanning(true)
    setScannedResult("")

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        videoConstraints: {
          facingMode: cameraType,
        },
      },
      false,
    )

    scanner.render(
      (decodedText) => {
        setScannedResult(decodedText)
        setIsScanning(false)
        try {
          scanner.clear()
        } catch (error) {
          console.log("Error clearing scanner after scan:", error)
        }
        scannerRef.current = null
        saveToHistory(decodedText)

        playSuccessSound()
        vibrateDevice()

        toast({
          title: "QR Code Scanned!",
          description: "Successfully scanned QR code",
        })
      },
      (error) => {
        // Silently handle scanning errors to avoid spam
        console.log("QR scan error:", error)
      },
    )

    scannerRef.current = scanner
  }

  const stopScanning = () => {
    try {
      if (scannerRef.current) {
        scannerRef.current.clear()
        scannerRef.current = null
      }
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch((error) => {
          console.log("Error stopping Html5Qrcode:", error)
        })
        html5QrCodeRef.current = null
      }
    } catch (error) {
      console.log("Error in stopScanning:", error)
    } finally {
      setIsScanning(false)
    }
  }

  const resetScanner = () => {
    stopScanning()
    setScannedResult("")
    const scannerElement = document.getElementById("qr-reader")
    if (scannerElement) {
      scannerElement.innerHTML = ""
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (isScanning) {
      stopScanning()
    }

    try {
      const html5QrCode = new Html5Qrcode("file-scan-result")
      html5QrCodeRef.current = html5QrCode

      const result = await html5QrCode.scanFile(file, true)
      setScannedResult(result)
      saveToHistory(result)
      playSuccessSound()
      vibrateDevice()

      toast({
        title: "QR Code Scanned!",
        description: "Successfully scanned QR code from image",
      })
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Could not find a valid QR code in the image",
        variant: "destructive",
      })
    } finally {
      html5QrCodeRef.current = null
    }
  }

  const playSuccessSound = () => {
    const savedSettings = localStorage.getItem("qr-settings")
    const settings = savedSettings ? JSON.parse(savedSettings) : { soundEnabled: true }

    if (settings.soundEnabled) {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }
  }

  const vibrateDevice = () => {
    const savedSettings = localStorage.getItem("qr-settings")
    const settings = savedSettings ? JSON.parse(savedSettings) : { vibrationEnabled: true }

    if (settings.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(200)
    }
  }

  const handleCopy = async () => {
    if (!scannedResult) return

    try {
      await navigator.clipboard.writeText(scannedResult)
      toast({
        title: "Copied!",
        description: "Scanned content copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleOpenLink = () => {
    if (!scannedResult) return

    if (scannedResult.match(/^https?:\/\//)) {
      window.open(scannedResult, "_blank")
    } else if (scannedResult.match(/^mailto:/)) {
      window.location.href = scannedResult
    } else if (scannedResult.match(/^tel:/)) {
      window.location.href = scannedResult
    } else {
      toast({
        title: "Not a Link",
        description: "The scanned content is not a clickable link",
        variant: "destructive",
      })
    }
  }

  const toggleCameraType = () => {
    setCameraType((prev) => (prev === "environment" ? "user" : "environment"))
    if (isScanning) {
      stopScanning()
      setTimeout(() => startCameraScanning(), 500)
    }
  }

  useEffect(() => {
    return () => {
      try {
        stopScanning()
      } catch (error) {
        console.log("Error during cleanup:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (scanMethod === "file" && isScanning) {
      stopScanning()
    }
  }, [scanMethod])

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">QR Code Scanner</CardTitle>
          <p className="text-center text-muted-foreground">Scan QR codes using your camera or upload an image</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={scanMethod} onValueChange={(value: String) => setScanMethod(value as "camera" | "file")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera">Camera Scanner</TabsTrigger>
              <TabsTrigger value="file">Upload Image</TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md">
                  {!isScanning && !scannedResult && (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">Camera preview will appear here</p>
                    </div>
                  )}

                  <div id="qr-reader" className="w-full"></div>
                </div>

                <div className="flex gap-2 mt-6 flex-wrap justify-center">
                  {!isScanning ? (
                    <Button onClick={startCameraScanning} disabled={isScanning}>
                      <Camera className="h-4 w-4 mr-2" />
                      Bật Camera
                    </Button>
                  ) : (
                    <Button onClick={stopScanning} variant="destructive">
                      Tắt Camera
                    </Button>
                  )}

                  <Button onClick={toggleCameraType} variant="outline" disabled={isScanning}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {cameraType === "environment" ? "Camera Sau" : "Camera Trước"}
                  </Button>

                  <Button onClick={resetScanner} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md">
                  <Label htmlFor="file-upload">Upload QR Code Image</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="mt-2"
                  />
                  <div id="file-scan-result" className="hidden"></div>
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center mt-4">
                  <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Select an image file containing a QR code</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {scannedResult && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Scanned Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Category: {detectCategory(scannedResult).toUpperCase()}
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {scannedResult.length} characters
                    </span>
                  </div>
                  <p className="text-green-700 dark:text-green-300 break-all">{scannedResult}</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleCopy} size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>

                  {(scannedResult.match(/^https?:\/\//) ||
                    scannedResult.match(/^mailto:/) ||
                    scannedResult.match(/^tel:/)) && (
                      <Button onClick={handleOpenLink} size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
