"use client"
import type React from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { ImageIcon, Palette, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WallBorder {
  width: number
  radius: number
  color: string
  style: "solid" | "dashed" | "dotted" | "double"
}

interface WallSettingsProps {
  wallSize: { width: number; height: number }
  onWallSizeChange: (size: { width: number; height: number }) => void
  wallBackground: any
  wallColor: string
  onWallColorChange: (color: string) => void
  onBackgroundChange: (bg: any) => void
  customBackgrounds: any[]
  onCustomBackgroundUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveCustomBackground: (bg: any) => void
  allBackgrounds: any[]
  onClose: () => void
  wallBorder: WallBorder
  onWallBorderChange: (border: WallBorder) => void
}

export default function WallSettings({
  wallSize,
  onWallSizeChange,
  wallBackground,
  wallColor,
  onWallColorChange,
  onBackgroundChange,
  customBackgrounds,
  onCustomBackgroundUpload,
  onRemoveCustomBackground,
  allBackgrounds,
  onClose,
  wallBorder,
  onWallBorderChange,
}: WallSettingsProps) {
  const customBackgroundInputRef = useRef<HTMLInputElement>(null)

  const presetSizes = [
    { name: "Instagram Post", width: 1080, height: 1080 },
    { name: "Instagram Story", width: 1080, height: 1920 },
    { name: "Facebook Cover", width: 1200, height: 630 },
    { name: "Twitter Header", width: 1500, height: 500 },
    { name: "Desktop Wallpaper", width: 1920, height: 1080 },
    { name: "Mobile Wallpaper", width: 1080, height: 1920 },
  ]

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Wall Settings
        </CardTitle>
        <CardDescription>Customize your wall appearance and dimensions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="size" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="size">Size</TabsTrigger>
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="borders">Borders</TabsTrigger>
          </TabsList>

          <TabsContent value="size" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={wallSize.width}
                  onChange={(e) => onWallSizeChange({ ...wallSize, width: Number.parseInt(e.target.value) })}
                  min="300"
                  max="4000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={wallSize.height}
                  onChange={(e) => onWallSizeChange({ ...wallSize, height: Number.parseInt(e.target.value) })}
                  min="300"
                  max="4000"
                />
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium mb-3 block">Preset Sizes</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presetSizes.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => onWallSizeChange({ width: preset.width, height: preset.height })}
                    className="justify-start text-xs"
                  >
                    <span className="font-medium">{preset.name}</span>
                    <span className="ml-auto text-muted-foreground">
                      {preset.width}×{preset.height}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="background" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Background Options</Label>
              <Button variant="outline" size="sm" onClick={() => customBackgroundInputRef.current?.click()}>
                <ImageIcon className="mr-1 h-3 w-3" />
                Upload Custom
              </Button>
            </div>

            <input
              type="file"
              ref={customBackgroundInputRef}
              accept="image/*"
              multiple
              onChange={onCustomBackgroundUpload}
              className="hidden"
            />

            <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {allBackgrounds.map((bg, index) => (
                <div
                  key={`${bg.name}-${index}`}
                  onClick={() => onBackgroundChange(bg)}
                  className={`h-16 rounded-lg border-2 cursor-pointer transition-all relative overflow-hidden group ${
                    wallBackground.value === bg.value
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{
                    background: bg.name === "Blank White Wall" ? wallColor : `url(${bg.value})`,
                    backgroundSize: bg.backgroundSize || "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                  title={bg.name}
                >
                  {bg.isCustom && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveCustomBackground(bg)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium text-center px-1">{bg.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {wallBackground.name === "Blank White Wall" && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Wall Color
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={wallColor}
                    onChange={(e) => onWallColorChange(e.target.value)}
                    className="w-16 h-10"
                  />
                  <span className="text-sm text-gray-600">Choose your wall color</span>
                </div>
              </div>
            )}

            {customBackgrounds.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Custom Backgrounds</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {customBackgrounds.length} custom background{customBackgrounds.length !== 1 ? "s" : ""} uploaded
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="borders" className="space-y-4">
            <Label className="text-sm font-medium">Wall Border</Label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Width: {wallBorder.width}px</Label>
                <Slider
                  value={[wallBorder.width]}
                  onValueChange={([value]) => onWallBorderChange({ ...wallBorder, width: value })}
                  max={50}
                  min={0}
                  step={1}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Border Radius: {wallBorder.radius}px</Label>
                <Slider
                  value={[wallBorder.radius]}
                  onValueChange={([value]) => onWallBorderChange({ ...wallBorder, radius: value })}
                  max={50}
                  min={0}
                  step={1}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Color</Label>
                <Input
                  type="color"
                  value={wallBorder.color}
                  onChange={(e) => onWallBorderChange({ ...wallBorder, color: e.target.value })}
                  className="mt-1 h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Style</Label>
                <Select
                  value={wallBorder.style}
                  onValueChange={(value: "solid" | "dashed" | "dotted" | "double") =>
                    onWallBorderChange({ ...wallBorder, style: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Apply Changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}
