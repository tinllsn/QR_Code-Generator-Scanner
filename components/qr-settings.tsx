"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import StorageManager from "@/components/storage-manager"

interface Settings {
  autoSave: boolean
  defaultErrorCorrection: "L" | "M" | "Q" | "H"
  defaultSize: number
  theme: "light" | "dark" | "system"
  soundEnabled: boolean
  vibrationEnabled: boolean
}

export default function QRSettings() {
  const [settings, setSettings] = useState<Settings>({
    autoSave: true,
    defaultErrorCorrection: "M",
    defaultSize: 256,
    theme: "system",
    soundEnabled: true,
    vibrationEnabled: true,
  })
  const { toast } = useToast()

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("qr-settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem("qr-settings", JSON.stringify(settings))
  }, [settings])

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved",
    })
  }

  const resetSettings = () => {
    const defaultSettings: Settings = {
      autoSave: true,
      defaultErrorCorrection: "M",
      defaultSize: 256,
      theme: "system",
      soundEnabled: true,
      vibrationEnabled: true,
    }
    setSettings(defaultSettings)
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults",
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="qr-defaults">QR Defaults</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <p className="text-muted-foreground">Configure app behavior and preferences</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Auto-save to History</Label>
                  <p className="text-sm text-muted-foreground">Automatically save generated and scanned QR codes</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting("autoSave", checked)}
                />
              </div>

              <div>
                <Label>Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value: "light" | "dark" | "system") => updateSetting("theme", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sound">Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">Play sound when QR code is scanned</p>
                </div>
                <Switch
                  id="sound"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vibration">Vibration</Label>
                  <p className="text-sm text-muted-foreground">Vibrate when QR code is scanned (mobile only)</p>
                </div>
                <Switch
                  id="vibration"
                  checked={settings.vibrationEnabled}
                  onCheckedChange={(checked) => updateSetting("vibrationEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr-defaults">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Defaults</CardTitle>
              <p className="text-muted-foreground">Set default values for QR code generation</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Default Error Correction Level</Label>
                <Select
                  value={settings.defaultErrorCorrection}
                  onValueChange={(value: "L" | "M" | "Q" | "H") => updateSetting("defaultErrorCorrection", value)}
                >
                  <SelectTrigger className="mt-2">
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
                <Label>Default Size: {settings.defaultSize}px</Label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  step="32"
                  value={settings.defaultSize}
                  onChange={(e) => updateSetting("defaultSize", Number(e.target.value))}
                  className="w-full mt-2"
                />
              </div>

              <Button onClick={resetSettings} variant="outline">
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <StorageManager />
        </TabsContent>
      </Tabs>

      {/* App Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>QR Code Generator & Scanner v1.0</p>
            <p>Built with React, Next.js, and Tailwind CSS</p>
            <p>Supports offline usage with PWA capabilities</p>
            <p>Uses html5-qrcode for scanning and react-qr-code for generation</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
