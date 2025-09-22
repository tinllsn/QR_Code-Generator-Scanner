"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Copy, Trash2, QrCode, Download, Upload, ExternalLink, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QRCode from "react-qr-code"

interface QRHistoryItem {
  id: string
  content: string
  type: "generated" | "scanned"
  timestamp: Date
  category: "text" | "url" | "email" | "phone" | "other"
}

export default function QRHistory() {
  const [historyItems, setHistoryItems] = useState<QRHistoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "generated" | "scanned">("all")
  const [filterCategory, setFilterCategory] = useState<"all" | "text" | "url" | "email" | "phone" | "other">("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [selectedItem, setSelectedItem] = useState<QRHistoryItem | null>(null)
  const { toast } = useToast()

  // Load history from localStorage on component mount
  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const savedHistory = localStorage.getItem("qr-history")
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory)
      setHistoryItems(
        parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })),
      )
    }
  }

  const filteredAndSortedItems = historyItems
    .filter((item) => {
      const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === "all" || item.type === filterType
      const matchesCategory = filterCategory === "all" || item.category === filterCategory
      return matchesSearch && matchesType && matchesCategory
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return b.timestamp.getTime() - a.timestamp.getTime()
      } else {
        return a.timestamp.getTime() - b.timestamp.getTime()
      }
    })

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (id: string) => {
    const updatedItems = historyItems.filter((item) => item.id !== id)
    setHistoryItems(updatedItems)
    localStorage.setItem("qr-history", JSON.stringify(updatedItems))
    toast({
      title: "Deleted",
      description: "Item removed from history",
    })
  }

  const handleClearAll = () => {
    setHistoryItems([])
    localStorage.removeItem("qr-history")
    toast({
      title: "Cleared",
      description: "All history items removed",
    })
  }

  const handleExportHistory = () => {
    const dataStr = JSON.stringify(historyItems, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `qr-history-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Exported!",
      description: "History exported successfully",
    })
  }

  const handleImportHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        const validatedData = importedData.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))

        // Merge with existing history, avoiding duplicates
        const existingIds = new Set(historyItems.map((item) => item.id))
        const newItems = validatedData.filter((item: QRHistoryItem) => !existingIds.has(item.id))

        const mergedHistory = [...historyItems, ...newItems]
        setHistoryItems(mergedHistory)
        localStorage.setItem("qr-history", JSON.stringify(mergedHistory))

        toast({
          title: "Imported!",
          description: `Added ${newItems.length} new items to history`,
        })
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid file format",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const handleOpenLink = (content: string) => {
    if (content.match(/^https?:\/\//)) {
      window.open(content, "_blank")
    } else if (content.match(/^mailto:/)) {
      window.location.href = content
    } else if (content.match(/^tel:/)) {
      window.location.href = content
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffInDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getStatistics = () => {
    const total = historyItems.length
    const generated = historyItems.filter((item) => item.type === "generated").length
    const scanned = historyItems.filter((item) => item.type === "scanned").length
    const categories = historyItems.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return { total, generated, scanned, categories }
  }

  const stats = getStatistics()

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>QR Code History</CardTitle>
          <p className="text-muted-foreground">View and manage your generated and scanned QR codes</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.generated}</div>
              <div className="text-sm text-muted-foreground">Generated</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.scanned}</div>
              <div className="text-sm text-muted-foreground">Scanned</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-purple-600">{Object.keys(stats.categories).length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </Card>
          </div>

          {/* Search & Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search history..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    value={filterType}
                    onValueChange={(value: "all" | "generated" | "scanned") => setFilterType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="generated">Generated</SelectItem>
                      <SelectItem value="scanned">Scanned</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterCategory}
                    onValueChange={(value: "all" | "text" | "url" | "email" | "phone" | "other") =>
                      setFilterCategory(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortOrder} onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count & Actions */}
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <p className="text-sm text-muted-foreground">
              {filteredAndSortedItems.length} item{filteredAndSortedItems.length !== 1 ? "s" : ""} found
            </p>
            <div className="flex gap-2">
              <Button onClick={handleExportHistory} variant="outline" size="sm" disabled={historyItems.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button asChild variant="outline" size="sm">
                <label>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                  <input type="file" accept=".json" onChange={handleImportHistory} className="hidden" />
                </label>
              </Button>
              {historyItems.length > 0 && (
                <Button onClick={handleClearAll} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* History Items */}
          <div className="space-y-3">
            {filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-12">
                <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {historyItems.length === 0 ? "No QR codes in history yet" : "No items match your search criteria"}
                </p>
              </div>
            ) : (
              filteredAndSortedItems.map((item) => (
                <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={item.type === "generated" ? "default" : "secondary"}>{item.type}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.category.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.timestamp)}
                        </div>
                      </div>

                      <h3 className="font-medium mb-1 truncate">
                        {item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
                      </h3>

                      <p className="text-sm text-muted-foreground break-all line-clamp-2">{item.content}</p>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>QR Code Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              <div className="p-4 bg-white rounded-lg">
                                <QRCode value={item.content} size={200} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Type:</span>
                                <Badge variant={item.type === "generated" ? "default" : "secondary"}>{item.type}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Category:</span>
                                <Badge variant="outline">{item.category.toUpperCase()}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Date:</span>
                                <span className="text-sm">{formatDate(item.timestamp)}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium">Content:</span>
                                <p className="text-sm text-muted-foreground break-all mt-1 p-2 bg-muted rounded">
                                  {item.content}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => handleCopy(item.content)} size="sm">
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </Button>
                              {(item.content.match(/^https?:\/\//) ||
                                item.content.match(/^mailto:/) ||
                                item.content.match(/^tel:/)) && (
                                <Button onClick={() => handleOpenLink(item.content)} size="sm" variant="outline">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Open
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button onClick={() => handleCopy(item.content)} size="sm" variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(item.id)} size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
