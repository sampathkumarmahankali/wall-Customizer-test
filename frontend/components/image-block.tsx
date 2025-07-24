"use client"

import { Rnd } from "react-rnd"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface ImageFrame {
  type: "none" | "classic" | "modern" | "vintage" | "ornate" | "rustic"
  width: number
  color: string
}

interface ImageData {
  id: number
  src: string
  style: {
    width: number
    height: number
  }
  position: {
    x: number
    y: number
  }
  filters: {
    brightness: number
    contrast: number
    saturation: number
    hue: number
    blur: number
  }
  shape: "rectangle" | "circle" | "oval" | "star" | "heart"
  frame: ImageFrame
  borderStyle: {
    width: number
    color: string
    style: "solid" | "dashed" | "dotted"
  }
  isCollage?: boolean
  collageImages?: string[]
}

interface ImageBlockProps {
  image: ImageData
  onUpdate: (id: number, updates: Partial<ImageData>) => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function ImageBlock({ image, onUpdate, onEdit, onDelete }: ImageBlockProps) {
  const [aspectRatio, setAspectRatio] = useState(1)
  const [imgSize, setImgSize] = useState({
    width: image.style.width,
    height: image.style.height,
  })
  const [isSelected, setIsSelected] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    if (!image.isCollage) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = image.src
      img.onload = () => {
        setAspectRatio(img.naturalWidth / img.naturalHeight)
        setImgSize({
          width: image.style.width,
          height: image.style.width / (img.naturalWidth / img.naturalHeight),
        })
      }
    }
  }, [image.src, image.style.width, image.isCollage])

  const handleResize = (e: any, direction: any, ref: any, delta: any, position: any) => {
    let newWidth = ref.offsetWidth
    let newHeight = ref.offsetHeight

    if (!image.isCollage) {
      if (direction.includes("right") || direction.includes("left")) {
        newHeight = newWidth / aspectRatio
      } else if (direction.includes("top") || direction.includes("bottom")) {
        newWidth = newHeight * aspectRatio
      }
    }

    setImgSize({ width: newWidth, height: newHeight })
    onUpdate(image.id, {
      style: { width: newWidth, height: newHeight },
      position: { x: position.x, y: position.y },
    })
  }

  const getClipPath = (shape: string) => {
    switch (shape) {
      case "circle":
        return "circle(50%)"
      case "oval":
        return "ellipse(50% 50%)"
      case "star":
        return "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
      case "heart":
        return 'path("M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z")'
      default:
        return "none"
    }
  }

  const getFrameStyle = (frame: ImageFrame) => {
    if (frame.type === "none" || frame.width === 0) return "none"

    const baseWidth = frame.width
    const color = frame.color || "#8B4513"

    switch (frame.type) {
      case "classic":
        return `${baseWidth}px solid ${color}`
      case "modern":
        return `${baseWidth}px solid #333333`
      case "vintage":
        return `${baseWidth}px ridge #8B4513`
      case "ornate":
        return `${baseWidth}px double #DAA520`
      case "rustic":
        return `${baseWidth}px outset #8B4513`
      default:
        return `${baseWidth}px solid ${color}`
    }
  }

  const renderCollage = () => {
    if (!image.collageImages || image.collageImages.length === 0) return null

    const cols = Math.ceil(Math.sqrt(image.collageImages.length))
    const rows = Math.ceil(image.collageImages.length / cols)

    return (
      <div className="w-full h-full grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {image.collageImages.map((imgSrc, index) => (
          <div key={index} className="overflow-hidden">
            <img
              src={imgSrc || "/placeholder.svg"}
              alt={`Collage ${index + 1}`}
              className="w-full h-full object-cover"
              style={{
                filter: `brightness(${image.filters.brightness}%) contrast(${image.filters.contrast}%) saturate(${image.filters.saturation}%) hue-rotate(${image.filters.hue}deg) blur(${image.filters.blur}px)`,
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <Rnd
      size={{ width: imgSize.width, height: imgSize.height }}
      position={{ x: image.position.x, y: image.position.y }}
      onDragStart={() => {
        setIsSelected(true)
        setIsDragging(true)
      }}
      onDragStop={(e: any, d) => {
        const x = Math.round(d.x)
        const y = Math.round(d.y)
        onUpdate(image.id, { position: { x, y } })
        setIsDragging(false)
        setTimeout(() => setIsSelected(false), 2000)
      }}
      onResizeStart={() => {
        setIsSelected(true)
        setIsResizing(true)
      }}
      onResizeStop={(e: any, direction, ref, delta, position) => {
        handleResize(e, direction, ref, delta, position)
        setIsResizing(false)
        setTimeout(() => setIsSelected(false), 2000)
      }}
      lockAspectRatio={!image.isCollage ? aspectRatio : false}
      bounds="parent"
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      style={{
        overflow: "hidden",
        transform: "translateZ(0)",
        willChange: "transform",
        border: isDragging || isResizing || isSelected ? "2px solid #3b82f6" : "2px solid transparent",
        transition: isDragging || isResizing ? "none" : "border-color 0.2s ease",
        zIndex: isSelected ? 10 : 1,
      }}
      className="group hover:border-gray-300"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (onEdit) {
          onEdit() // Left click to edit
        }
        setIsSelected(true)
        setTimeout(() => {
          if (!isDragging && !isResizing) {
            setIsSelected(false)
          }
        }, 3000)
      }}
      data-image-id={image.id}
      data-image-src={image.src || "/placeholder.svg"}
    >
      <div
        className="w-full h-full"
        style={{
          clipPath: getClipPath(image.shape),
          border: getFrameStyle(image.frame),
          boxSizing: "border-box",
        }}
      >
        {image.isCollage ? (
          renderCollage()
        ) : (
          <img
            src={image.src || "/placeholder.svg"}
            alt="uploaded"
            style={{
              width: "100%",
              height: "100%",
              // objectFit: "cover",
              pointerEvents: "none",
              imageRendering: "crisp-edges",
              display: "block",
              filter: `brightness(${image.filters.brightness}%) contrast(${image.filters.contrast}%) saturate(${image.filters.saturation}%) hue-rotate(${image.filters.hue}deg) blur(${image.filters.blur}px)`,
            }}
            loading="eager"
            decoding="sync"
            data-loaded="true"
          />
        )}
      </div>

      {/* Delete button only */}
      <div
        className={`absolute -top-8 -right-8 flex gap-1 transition-opacity bg-white rounded shadow-sm ${
          isSelected || isDragging || isResizing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{ zIndex: 20 }}
      >
        {image.isCollage && (
          <div className="absolute -top-6 -left-12 bg-purple-500 text-white text-xs px-2 py-1 rounded">
            Collage Photo
          </div>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="destructive"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Rnd>
  )
}
