"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, ImageIcon, Palette, Frame, Users, Trash2 } from "lucide-react"

interface ImageData {
  id: number
  src: string
  originalSrc: string
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
  frame: {
    type: "none" | "classic" | "modern" | "vintage" | "ornate" | "rustic"
    width: number
    color: string
  }
  borderStyle: {
    width: number
    color: string
    style: "solid" | "dashed" | "dotted"
  }
  isCollage?: boolean
  collageImages?: string[]
}

interface ImageEditorProps {
  images: ImageData[]
  editingImageId: number | null
  onSelectImage: (id: number | null) => void
  onUpdateImage: (id: number, updates: Partial<ImageData>) => void
  onCreateCollage: (selectedImages: string[]) => void
  onDeleteImage?: (id: number) => void
}

export default function ImageEditor({
  images,
  editingImageId,
  onSelectImage,
  onUpdateImage,
  onCreateCollage,
  onDeleteImage,
}: ImageEditorProps) {
  const [selectedForCollage, setSelectedForCollage] = useState<string[]>([])
  const [collageMode, setCollageMode] = useState(false)

  const editingImage = editingImageId ? images.find((img) => img.id === editingImageId) : null

  const handleCollageSelection = (imageSrc: string) => {
    if (selectedForCollage.includes(imageSrc)) {
      setSelectedForCollage(selectedForCollage.filter((src) => src !== imageSrc))
    } else {
      setSelectedForCollage([...selectedForCollage, imageSrc])
    }
  }

  const createCollage = () => {
    if (selectedForCollage.length >= 2) {
      onCreateCollage(selectedForCollage)
      setSelectedForCollage([])
      setCollageMode(false)
    }
  }

  const handleDeleteImage = (imageId: number) => {
    if (onDeleteImage) {
      onDeleteImage(imageId)
      // If we're editing the deleted image, clear the selection
      if (editingImageId === imageId) {
        onSelectImage(null)
      }
    }
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

  const getFrameStyle = (frame: any) => {
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

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Edit className="h-4 w-4" />
          Image Editor
        </CardTitle>
        <CardDescription className="text-sm">Edit images and create collages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery" className="text-xs">
              <ImageIcon className="h-3 w-3 mr-1" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="edit" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Edit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Your Images ({images.length})</Label>
              <Button
                size="sm"
                variant={collageMode ? "default" : "outline"}
                onClick={() => {
                  setCollageMode(!collageMode)
                  setSelectedForCollage([])
                }}
                className="text-xs"
              >
                <Users className="h-3 w-3 mr-1" />
                Collage
              </Button>
            </div>

            {collageMode && (
              <div className="p-2 bg-blue-50 rounded text-xs">
                <p className="text-blue-800 mb-2">
                  Select 2+ images for collage ({selectedForCollage.length} selected)
                </p>
                {selectedForCollage.length >= 2 && (
                  <Button size="sm" onClick={createCollage} className="text-xs">
                    Create Collage Photo
                  </Button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`relative cursor-pointer rounded border-2 transition-all group ${
                    editingImageId === img.id
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : collageMode && selectedForCollage.includes(img.src)
                        ? "border-green-500 ring-2 ring-green-200"
                        : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    if (collageMode) {
                      handleCollageSelection(img.src)
                    } else {
                      onSelectImage(img.id === editingImageId ? null : img.id)
                    }
                  }}
                >
                  <div className="aspect-square overflow-hidden rounded">
                    <img
                      src={img.src || "/placeholder.svg"}
                      alt="Gallery"
                      className="w-full h-full object-cover"
                      style={{
                        filter: `brightness(${img.filters.brightness}%) contrast(${img.filters.contrast}%) saturate(${img.filters.saturation}%) hue-rotate(${img.filters.hue}deg) blur(${img.filters.blur}px)`,
                        clipPath: getClipPath(img.shape),
                        border: getFrameStyle(img.frame),
                      }}
                    />
                  </div>

                  {/* Delete button - appears on hover */}
                  {onDeleteImage && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteImage(img.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}

                  {img.isCollage && (
                    <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-1 rounded">Collage</div>
                  )}
                </div>
              ))}
            </div>

            {images.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No images added yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="edit" className="space-y-4">
            {editingImage ? (
              <>
                {/* Larger Preview with Delete Option */}
                <div className="bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden p-4 relative">
                  <div className="relative w-32 h-32">
                    <img
                      src={editingImage.src || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                      style={{
                        filter: `brightness(${editingImage.filters.brightness}%) contrast(${editingImage.filters.contrast}%) saturate(${editingImage.filters.saturation}%) hue-rotate(${editingImage.filters.hue}deg) blur(${editingImage.filters.blur}px)`,
                        clipPath: getClipPath(editingImage.shape),
                        border: getFrameStyle(editingImage.frame),
                      }}
                    />
                  </div>

                  {/* Delete button for currently editing image */}
                  {onDeleteImage && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={() => handleDeleteImage(editingImage.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Shape Selection */}
                <div>
                  <Label className="text-xs font-medium mb-2 block">Shape</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { value: "rectangle", label: "Rectangle" },
                      { value: "circle", label: "Circle" },
                      { value: "oval", label: "Oval" },
                      { value: "star", label: "Star" },
                      { value: "heart", label: "Heart" },
                    ].map((shape) => (
                      <Button
                        key={shape.value}
                        variant={editingImage.shape === shape.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => onUpdateImage(editingImage.id, { shape: shape.value as any })}
                        className="text-xs p-1 h-8"
                      >
                        {shape.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Frame Selection */}
                <div>
                  <Label className="text-xs font-medium mb-2 block">Frame</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { type: "none", name: "None" },
                      { type: "classic", name: "Classic" },
                      { type: "modern", name: "Modern" },
                      { type: "vintage", name: "Vintage" },
                      { type: "ornate", name: "Ornate" },
                      { type: "rustic", name: "Rustic" },
                    ].map((frame) => (
                      <Button
                        key={frame.type}
                        variant={editingImage.frame.type === frame.type ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          onUpdateImage(editingImage.id, {
                            frame: {
                              ...editingImage.frame,
                              type: frame.type as any,
                              width: frame.type === "none" ? 0 : 8,
                            },
                          })
                        }
                        className="text-xs p-1"
                      >
                        {frame.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Frame Color Picker - Only show when frame is not "none" */}
                {editingImage.frame.type !== "none" && (
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Frame Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={editingImage.frame.color}
                        onChange={(e) =>
                          onUpdateImage(editingImage.id, {
                            frame: { ...editingImage.frame, color: e.target.value },
                          })
                        }
                        className="w-12 h-8"
                      />
                      <span className="text-xs text-gray-600">Custom frame color</span>
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="space-y-3">
                  <Label className="text-xs font-medium">Filters</Label>

                  <div>
                    <Label className="text-xs">Brightness: {editingImage.filters.brightness}%</Label>
                    <Input
                      type="range"
                      min="0"
                      max="200"
                      value={editingImage.filters.brightness}
                      onChange={(e) =>
                        onUpdateImage(editingImage.id, {
                          filters: { ...editingImage.filters, brightness: Number(e.target.value) },
                        })
                      }
                      className="mt-1 h-2"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Contrast: {editingImage.filters.contrast}%</Label>
                    <Input
                      type="range"
                      min="0"
                      max="200"
                      value={editingImage.filters.contrast}
                      onChange={(e) =>
                        onUpdateImage(editingImage.id, {
                          filters: { ...editingImage.filters, contrast: Number(e.target.value) },
                        })
                      }
                      className="mt-1 h-2"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Saturation: {editingImage.filters.saturation}%</Label>
                    <Input
                      type="range"
                      min="0"
                      max="200"
                      value={editingImage.filters.saturation}
                      onChange={(e) =>
                        onUpdateImage(editingImage.id, {
                          filters: { ...editingImage.filters, saturation: Number(e.target.value) },
                        })
                      }
                      className="mt-1 h-2"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Hue: {editingImage.filters.hue}°</Label>
                    <Input
                      type="range"
                      min="-360"
                      max="360"
                      value={editingImage.filters.hue}
                      onChange={(e) =>
                        onUpdateImage(editingImage.id, {
                          filters: { ...editingImage.filters, hue: Number(e.target.value) },
                        })
                      }
                      className="mt-1 h-2"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Blur: {editingImage.filters.blur}px</Label>
                    <Input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={editingImage.filters.blur}
                      onChange={(e) =>
                        onUpdateImage(editingImage.id, {
                          filters: { ...editingImage.filters, blur: Number(e.target.value) },
                        })
                      }
                      className="mt-1 h-2"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                <Frame className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Select an image to edit
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
