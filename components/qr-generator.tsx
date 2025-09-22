"use client"

import { useState, useRef, useEffect } from "react"
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Copy, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRHistoryItem {
  id: string
  content: string
  type: "generated" | "scanned"
  timestamp: Date
  category: "text" | "url" | "email" | "phone" | "other"
}

export default function QRGenerator() {
  const [text, setText] = useState("")
  const [foregroundColor, setForegroundColor] = useState("#000000")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<"L" | "M" | "Q" | "H">("M")
  const [size, setSize] = useState(256)
  const qrRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const savedSettings = localStorage.getItem("qr-settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setErrorCorrectionLevel(settings.defaultErrorCorrection || "M")
      setSize(settings.defaultSize || 256)
    }
  }, [])

  useEffect(() => {
    if (text.trim()) {
      const savedSettings = localStorage.getItem("qr-settings")
      const settings = savedSettings ? JSON.parse(savedSettings) : { autoSave: true }

      if (settings.autoSave) {
        saveToHistory()
      }
    }
  }, [text, foregroundColor, backgroundColor, errorCorrectionLevel])

  const saveToHistory = () => {
    if (!text.trim()) return

    const historyItem: QRHistoryItem = {
      id: Date.now().toString(),
      content: text,
      type: "generated",
      timestamp: new Date(),
      category: detectCategory(text),
    }

    const existingHistory = localStorage.getItem("qr-history")
    const history = existingHistory ? JSON.parse(existingHistory) : []

    // Check if this content already exists to avoid duplicates
    const exists = history.some((item: QRHistoryItem) => item.content === text && item.type === "generated")

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

  const handleDownload = () => {
    if (!qrRef.current || !text) return

    const svg = qrRef.current.querySelector("svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    canvas.width = size
    canvas.height = size

    img.onload = () => {
      if (ctx) {
        // Set white background
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, size, size)
        ctx.drawImage(img, 0, 0)
      }

      const link = document.createElement("a")
      link.download = `qrcode-${Date.now()}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()

      toast({
        title: "Downloaded!",
        description: "QR code saved as PNG image",
      })
    }

    img.crossOrigin = "anonymous"
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const handleCopy = async () => {
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "QR code content copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    if (!text) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: "QR Code",
          text: text,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      handleCopy()
    }
  }

  const presetTemplates = [
    { label: "WiFi Network", value: "WIFI:T:WPA;S:NetworkName;P:Password;H:false;;" },
    { label: "Email", value: "mailto:example@email.com?subject=Hello&body=Message" },
    { label: "Phone", value: "tel:+1234567890" },
    { label: "SMS", value: "sms:+1234567890?body=Hello" },
    { label: "Website", value: "https://example.com" },
  ]

  const handlePresetSelect = (preset: string) => {
    setText(preset)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generate QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="text">Text or URL</Label>
            <Textarea
              id="text"
              placeholder="Enter text or URL to generate QR code..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label>Quick Templates</Label>
            <Select onValueChange={handlePresetSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {presetTemplates.map((template) => (
                  <SelectItem key={template.label} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="foreground">Foreground Color</Label>
              <div className="flex gap-2">
                <Input
                  id="foreground"
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="background">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="background"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Error Correction Level</Label>
            <Select
              value={errorCorrectionLevel}
              onValueChange={(value: "L" | "M" | "Q" | "H") => setErrorCorrectionLevel(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (~7%)</SelectItem>
                <SelectItem value="M">Medium (~15%)</SelectItem>
                <SelectItem value="Q">Quartile (~25%)</SelectItem>
                <SelectItem value="H">High (~30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="size">Size: {size}px</Label>
            <Input
              id="size"
              type="range"
              min="128"
              max="512"
              step="32"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      <Card>
        <CardHeader>
          <CardTitle>Generated QR Code</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {text ? (
            <>
              <div ref={qrRef} className="p-4 rounded-lg" style={{ backgroundColor }}>
                <QRCode
                  value={text}
                  size={size}
                  fgColor={foregroundColor}
                  bgColor={backgroundColor}
                  level={errorCorrectionLevel}
                />
              </div>

              <div className="flex gap-2 flex-wrap justify-center">
                <Button onClick={handleDownload} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleCopy} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Content
                </Button>
                <Button onClick={handleShare} variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Category: {detectCategory(text).toUpperCase()}</p>
                <p>Characters: {text.length}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Enter text or URL to generate QR code
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
