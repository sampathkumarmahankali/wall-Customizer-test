"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Download, FileImage, FileText, X } from "lucide-react"

interface ExportDialogProps {
  wallRef: React.RefObject<HTMLDivElement>
  wallSize: { width: number; height: number }
  wallBackground: any
  wallBorder: any
  images: any[]
  onClose: () => void
}

export default function ExportDialog({
  wallRef,
  wallSize,
  wallBackground,
  wallBorder,
  images,
  onClose,
}: ExportDialogProps) {
  const [format, setFormat] = useState<"png" | "jpg" | "pdf">("pdf")
  const [quality, setQuality] = useState("standard")
  const [fileName, setFileName] = useState("mialter-altar")
  const [isExporting, setIsExporting] = useState(false)

  const getScale = () => {
    switch (quality) {
      case "4x":
        return 4
      case "8k":
        // Calculate scale to make the longest side 7680px
        const longestSide = Math.max(wallSize.width, wallSize.height)
        return 7680 / longestSide
      default:
        return 1
    }
  }

  const exportWall = async () => {
    if (!wallRef.current) return

    setIsExporting(true)

    try {
      const scale = getScale()
      // Get the wall container
      const wallContainer = wallRef.current
      const wallRect = wallContainer.getBoundingClientRect()

      // Create canvas with exact wall dimensions
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Could not get canvas context")

      // Set canvas size to match wall exactly
      canvas.width = wallSize.width * scale
      canvas.height = wallSize.height * scale
      ctx.scale(scale, scale)

      // Clear canvas
      ctx.clearRect(0, 0, wallSize.width, wallSize.height)

      // Draw background first
      await drawWallBackground(ctx, wallSize.width, wallSize.height)

      // Draw wall border if exists
      if (wallBorder && wallBorder.width > 0) {
        drawWallBorder(ctx, wallSize.width, wallSize.height)
      }

      // Find all Rnd containers (these contain the frames and images)
      const rndContainers = wallContainer.querySelectorAll(".react-draggable")

      for (let i = 0; i < rndContainers.length; i++) {
        const container = rndContainers[i] as HTMLElement

        try {
          // Get container position and size
          const containerRect = container.getBoundingClientRect()
          const wallRect = wallContainer.getBoundingClientRect()

          // Calculate relative position within the wall
          const relativeX = containerRect.left - wallRect.left
          const relativeY = containerRect.top - wallRect.top
          const containerWidth = containerRect.width
          const containerHeight = containerRect.height

          // Find the image data for this container
          const imageId = container.getAttribute("data-image-id")
          const imageData = images.find((img) => img.id.toString() === imageId)

          if (!imageData) {
            continue
          }

          // Handle collage images
          if (imageData.isCollage && imageData.collageImages) {
            await drawCollageOnCanvas(
              ctx,
              relativeX,
              relativeY,
              containerWidth,
              containerHeight,
              imageData.collageImages,
              imageData.filters,
            )
          } else {
            // Handle single image
            const imgElement = container.querySelector("img") as HTMLImageElement
            if (!imgElement) {
              continue
            }

            // Create a new image for canvas drawing
            const canvasImg = new Image()
            canvasImg.crossOrigin = "anonymous"

            await new Promise((resolve, reject) => {
              canvasImg.onload = resolve
              canvasImg.onerror = reject
              canvasImg.src = imageData.src
            })

            // Apply filters
            if (imageData.filters) {
              const filterString = `brightness(${imageData.filters.brightness}%) contrast(${imageData.filters.contrast}%) saturate(${imageData.filters.saturation}%) hue-rotate(${imageData.filters.hue}deg) blur(${imageData.filters.blur}px)`
              ctx.filter = filterString
            }

            // Apply shape clipping
            if (imageData.shape && imageData.shape !== "rectangle") {
              ctx.save()
              applyShapeClipping(ctx, imageData.shape, relativeX, relativeY, containerWidth, containerHeight)
            }

            // Draw the image
            ctx.drawImage(canvasImg, relativeX, relativeY, containerWidth, containerHeight)

            // Restore context if shape was applied
            if (imageData.shape && imageData.shape !== "rectangle") {
              ctx.restore()
            }

            // Reset filter
            ctx.filter = "none"
          }

          // Draw frame - this is the key fix!
          if (imageData.frame && imageData.frame.type !== "none" && imageData.frame.width > 0) {
            drawImageFrame(ctx, relativeX, relativeY, containerWidth, containerHeight, imageData.frame)
          }

        } catch (error) {
          // console.error(`Failed to process container ${i + 1}:`, error)
        }
      }

      // Export based on format
      if (format === "pdf") {
        try {
          const jsPDF = (await import("jspdf")).default
          const imgData = canvas.toDataURL("image/png", 1.0)

          const pdfWidth = wallSize.width * 0.75
          const pdfHeight = wallSize.height * 0.75

          const pdf = new jsPDF({
            orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
            unit: "pt",
            format: [pdfWidth, pdfHeight],
          })

          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
          pdf.save(`${fileName}.pdf`)
        } catch (error) {
          // console.error("PDF export failed:", error)
          // Fallback to PNG
          downloadCanvas(canvas, `${fileName}.png`, "image/png")
        }
      } else {
        // Export as PNG or JPG
        downloadCanvas(canvas, `${fileName}.${format}`, `image/${format}`, 1.0)
      }
    } catch (error) {
      // console.error("Export failed:", error)
      if (error && typeof error === "object" && "message" in error) {
        alert(`Export failed: ${(error as { message: string }).message}`)
      } else {
        alert("Export failed: Unknown error")
      }
    } finally {
      setIsExporting(false)
    }
  }

  const drawWallBackground = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const bgValue = wallBackground.value

    if (bgValue.startsWith("#")) {
      // Solid color
      ctx.fillStyle = bgValue
      ctx.fillRect(0, 0, width, height)
    } else {
      // Background image
      try {
        const img = new Image()
        img.crossOrigin = "anonymous"
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = bgValue
        })

        // Draw background to cover entire canvas
        const scaleX = width / img.width
        const scaleY = height / img.height
        const scale = Math.max(scaleX, scaleY)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        const x = (width - scaledWidth) / 2
        const y = (height - scaledHeight) / 2

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
      } catch (error) {
        // console.error("Failed to load background image:", error)
        ctx.fillStyle = "#f5f5f5"
        ctx.fillRect(0, 0, width, height)
      }
    }
  }

  const drawWallBorder = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = wallBorder.color
    ctx.lineWidth = wallBorder.width

    if (wallBorder.style === "dashed") {
      ctx.setLineDash([10, 5])
    } else if (wallBorder.style === "dotted") {
      ctx.setLineDash([2, 2])
    } else if (wallBorder.style === "double") {
      ctx.setLineDash([])
      ctx.strokeRect(wallBorder.width / 2, wallBorder.width / 2, width - wallBorder.width, height - wallBorder.width)
      const innerOffset = wallBorder.width * 2
      ctx.strokeRect(innerOffset, innerOffset, width - innerOffset * 2, height - innerOffset * 2)
      return
    } else {
      ctx.setLineDash([])
    }

    ctx.strokeRect(wallBorder.width / 2, wallBorder.width / 2, width - wallBorder.width, height - wallBorder.width)
  }

  const applyShapeClipping = (
    ctx: CanvasRenderingContext2D,
    shape: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => {
    ctx.beginPath()

    switch (shape) {
      case "circle":
        const radius = Math.min(width, height) / 2
        ctx.arc(x + width / 2, y + height / 2, radius, 0, 2 * Math.PI)
        break
      case "oval":
        ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI)
        break
      case "star":
        const centerX = x + width / 2
        const centerY = y + height / 2
        const outerRadius = Math.min(width, height) / 2
        const innerRadius = outerRadius / 2
        const spikes = 5
        let rot = (Math.PI / 2) * 3
        const step = Math.PI / spikes

        ctx.moveTo(centerX, centerY - outerRadius)
        for (let i = 0; i < spikes; i++) {
          const xOuter = centerX + Math.cos(rot) * outerRadius
          const yOuter = centerY + Math.sin(rot) * outerRadius
          ctx.lineTo(xOuter, yOuter)
          rot += step

          const xInner = centerX + Math.cos(rot) * innerRadius
          const yInner = centerY + Math.sin(rot) * innerRadius
          ctx.lineTo(xInner, yInner)
          rot += step
        }
        ctx.closePath()
        break
      case "heart":
        const heartCenterX = x + width / 2
        const heartCenterY = y + height / 2
        const heartSize = Math.min(width, height) / 2
        const topCurveHeight = heartSize * 0.3

        ctx.moveTo(heartCenterX, heartCenterY + topCurveHeight)
        ctx.bezierCurveTo(
          heartCenterX,
          heartCenterY,
          heartCenterX - heartSize / 2,
          heartCenterY,
          heartCenterX - heartSize / 2,
          heartCenterY + topCurveHeight,
        )
        ctx.bezierCurveTo(
          heartCenterX - heartSize / 2,
          heartCenterY + (heartSize + topCurveHeight) / 2,
          heartCenterX,
          heartCenterY + (heartSize + topCurveHeight) / 2,
          heartCenterX,
          heartCenterY + heartSize,
        )
        ctx.bezierCurveTo(
          heartCenterX,
          heartCenterY + (heartSize + topCurveHeight) / 2,
          heartCenterX + heartSize / 2,
          heartCenterY + (heartSize + topCurveHeight) / 2,
          heartCenterX + heartSize / 2,
          heartCenterY + topCurveHeight,
        )
        ctx.bezierCurveTo(
          heartCenterX + heartSize / 2,
          heartCenterY,
          heartCenterX,
          heartCenterY,
          heartCenterX,
          heartCenterY + topCurveHeight,
        )
        ctx.closePath()
        break
      default:
        ctx.rect(x, y, width, height)
    }

    ctx.clip()
  }

  const drawImageFrame = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    frame: any,
  ) => {
    if (!frame || frame.type === "none" || frame.width === 0) return

    ctx.save()

    // Scale down frame width to match display - this was the issue!
    const frameWidth = frame.width * 0.6 // Reduce thickness by 40%
    const color = frame.color || "#8B4513"

    ctx.strokeStyle = color
    ctx.lineWidth = frameWidth
    ctx.setLineDash([]) // Reset line dash

    switch (frame.type) {
      case "classic":
        // Simple solid frame
        ctx.strokeRect(x - frameWidth / 2, y - frameWidth / 2, width + frameWidth, height + frameWidth)
        break
      case "modern":
        // Modern dark frame
        ctx.strokeStyle = "#333333"
        ctx.strokeRect(x - frameWidth / 2, y - frameWidth / 2, width + frameWidth, height + frameWidth)
        break
      case "vintage":
        // Vintage ridged frame effect
        ctx.strokeStyle = color
        for (let i = 0; i < frameWidth; i += 1) {
          const alpha = 1 - (i / frameWidth) * 0.3
          ctx.globalAlpha = alpha
          ctx.strokeRect(x - i, y - i, width + i * 2, height + i * 2)
        }
        ctx.globalAlpha = 1
        break
      case "ornate":
        // Ornate double frame - reduce both outer and inner frame
        ctx.strokeStyle = "#DAA520" // Gold color
        // Outer frame
        ctx.lineWidth = frameWidth / 3
        ctx.strokeRect(x - frameWidth * 0.8, y - frameWidth * 0.8, width + frameWidth * 1.6, height + frameWidth * 1.6)
        // Inner frame
        ctx.lineWidth = frameWidth / 3
        ctx.strokeRect(x - frameWidth / 2, y - frameWidth / 2, width + frameWidth, height + frameWidth)
        break
      case "rustic":
        // Rustic wooden frame effect
        ctx.strokeStyle = color
        ctx.lineWidth = frameWidth
        // Main frame
        ctx.strokeRect(x - frameWidth / 2, y - frameWidth / 2, width + frameWidth, height + frameWidth)
        // Add texture lines with reduced thickness
        ctx.lineWidth = 0.5
        for (let i = 0; i < frameWidth; i += 2) {
          ctx.globalAlpha = 0.3
          ctx.strokeRect(x - i, y - i, width + i * 2, height + i * 2)
        }
        ctx.globalAlpha = 1
        break
      default:
        // Default solid frame
        ctx.strokeRect(x - frameWidth / 2, y - frameWidth / 2, width + frameWidth, height + frameWidth)
    }

    ctx.restore()
  }

  const drawCollageOnCanvas = async (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    collageImages: string[],
    filters: any,
  ) => {
    const cols = Math.ceil(Math.sqrt(collageImages.length))
    const rows = Math.ceil(collageImages.length / cols)
    const cellWidth = width / cols
    const cellHeight = height / rows

    for (let i = 0; i < collageImages.length; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const cellX = x + col * cellWidth
      const cellY = y + row * cellHeight

      try {
        const img = new Image()
        img.crossOrigin = "anonymous"
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = collageImages[i]
        })

        // Apply filters to collage images
        if (filters) {
          const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hue}deg) blur(${filters.blur}px)`
          ctx.filter = filterString
        }

        ctx.drawImage(img, cellX, cellY, cellWidth, cellHeight)
        ctx.filter = "none" // Reset filter

      } catch (error) {
        // console.error(`Failed to load collage image ${i}:`, error)
      }
    }
  }

  const downloadCanvas = (canvas: HTMLCanvasElement, filename: string, mimeType: string, quality = 1.0) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = filename
          link.click()
          URL.revokeObjectURL(url)
        }
      },
      mimeType,
      quality,
    )
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="h-4 w-4" />
            Export Wall
          </CardTitle>
          <CardDescription className="text-sm">Export options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto">
          <div>
            <Label htmlFor="filename" className="text-sm">
              File Name
            </Label>
            <Input
              id="filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="mialter-altar"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm">Format</Label>
            <Select value={format} onValueChange={(value: "png" | "jpg" | "pdf") => setFormat(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF (Recommended)
                  </div>
                </SelectItem>
                <SelectItem value="png">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    PNG (Best Quality)
                  </div>
                </SelectItem>
                <SelectItem value="jpg">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    JPG (Smaller Size)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {format !== "pdf" && (
            <div>
              <Label className="text-sm">Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="4x">4x Resolution</SelectItem>
                  <SelectItem value="8k">8K Resolution</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Output: {Math.round(wallSize.width * getScale())} × {Math.round(wallSize.height * getScale())}px
              </p>
            </div>
          )}

          <Separator />

          <div className="bg-green-50 p-2 rounded-lg">
            <p className="text-xs text-green-800">
              <strong>Perfect Export:</strong> Use PNG export option for better quality
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} size="sm">
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
            <Button onClick={exportWall} disabled={isExporting} size="sm">
              <Download className="mr-1 h-3 w-3" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
