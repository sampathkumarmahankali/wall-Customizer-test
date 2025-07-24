"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, Palette, Plus, Trash2, Home, User } from "lucide-react";

// Preset wall backgrounds
const backgroundOptions = [
  { name: "Blank White Wall", value: "#ffffff", backgroundSize: "auto" },
  { name: "Modern Living Room", value: "/walls/modern-living-room.jpg", backgroundSize: "cover" },
  { name: "Scandinavian Interior", value: "/walls/scandinavian-interior.jpg", backgroundSize: "cover" },
  { name: "White Brick Wall", value: "/walls/white-brick-wall.jpg", backgroundSize: "cover" },
  { name: "Rustic Wood Planks", value: "/walls/rustic-wood-planks.jpg", backgroundSize: "cover" },
  { name: "Vintage Brick Wall", value: "/walls/vintage-brick-wall.jpg", backgroundSize: "cover" },
];

interface CustomBackground {
  name: string;
  value: string;
  isCustom: boolean;
  file: File;
  backgroundSize: string;
}

interface WallCreatorProps {
  onSubmit: (settings: any) => void;
}

export default function WallCreator({ onSubmit }: WallCreatorProps) {
  const [wallSize, setWallSize] = useState({ width: 600, height: 400 });
  const [wallColor, setWallColor] = useState("#ffffff");
  const [wallBackground, setWallBackground] = useState(backgroundOptions[0]);
  const [customBackgrounds, setCustomBackgrounds] = useState<CustomBackground[]>([]);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const customBgs: CustomBackground[] = files.map((file) => ({
      name: file.name.split(".")[0],
      value: URL.createObjectURL(file),
      isCustom: true,
      file: file,
      backgroundSize: "cover",
    }));
    setCustomBackgrounds((prev) => [...prev, ...customBgs]);
  };

  const removeCustomBackground = (bgToRemove: CustomBackground) => {
    setCustomBackgrounds((prev) => prev.filter((bg) => bg.value !== bgToRemove.value));
    if (wallBackground.value === bgToRemove.value) {
      setWallBackground(backgroundOptions[0]);
    }
    URL.revokeObjectURL(bgToRemove.value);
  };

  const allBackgrounds: (typeof backgroundOptions[0] | CustomBackground)[] = [...backgroundOptions, ...customBackgrounds];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      wallSize,
      wallColor,
      wallBackground,
      customBackgrounds,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] flex flex-col items-center px-4 relative"> {/* Light gold/cream background */}
      {/* Decorative background shapes below header, above main content */}
      <div className="w-full relative" style={{ height: '0' }}>
        <div className="absolute left-0 top-0 w-64 h-64 bg-[#FFD700]/30 rounded-3xl rotate-6 z-0 pointer-events-none" style={{ zIndex: 0 }} /> {/* Gold */}
        <div className="absolute right-0 top-12 w-32 h-32 bg-[#A0522D]/20 rounded-full z-0 pointer-events-none" style={{ zIndex: 0 }} /> {/* Brown */}
        <div className="absolute left-1/2 top-20 w-24 h-24 bg-[#C71585]/20 rounded-full z-0 pointer-events-none" style={{ zIndex: 0 }} /> {/* Rose */}
        <div className="absolute right-1/4 top-32 w-20 h-20 bg-[#8e44ad]/20 rounded-full z-0 pointer-events-none" style={{ zIndex: 0 }} /> {/* Purple */}
      </div>
      {/* Main content below header and shapes */}
      <div className="w-full flex-1 flex items-center justify-center relative z-10 mt-8">
        <div className="max-w-4xl mx-auto w-full p-6">
          <Card className="shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30 rounded-3xl backdrop-blur-lg">
            <CardHeader className="text-center">
              <CardDescription className="text-lg text-gray-600 font-medium">
                MIALTER - Create your perfect virtual altar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="width">Wall Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={wallSize.width}
                      onChange={(e) => setWallSize({ ...wallSize, width: Number.parseInt(e.target.value) })}
                      min="300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Wall Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={wallSize.height}
                      onChange={(e) => setWallSize({ ...wallSize, height: Number.parseInt(e.target.value) })}
                      min="300"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-base font-medium">Wall Background</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => backgroundInputRef.current && backgroundInputRef.current.click()}
                      className="text-xs"
                    >
                      <ImageIcon className="mr-1 h-3 w-3" />
                      Upload Custom
                    </Button>
                  </div>
                  <input
                    type="file"
                    ref={backgroundInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {allBackgrounds.map((bg, index) => (
                      <div
                        key={`${bg.name}-${index}`}
                        className={`h-24 rounded-lg border-2 cursor-pointer transition-all relative overflow-hidden group ${
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
                        <div className="absolute inset-0" onClick={() => setWallBackground(bg)} />
                        {('isCustom' in bg && bg.isCustom) && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCustomBackground(bg as CustomBackground);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 opacity-0 hover:opacity-100 transition-opacity">
                          {bg.name}
                          {('isCustom' in bg && bg.isCustom) && " (Custom)"}
                        </div>
                      </div>
                    ))}
                  </div>
                  {wallBackground.name === "Blank White Wall" && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Wall Color
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={wallColor}
                          onChange={(e) => setWallColor(e.target.value)}
                          className="w-16 h-10"
                        />
                        <span className="text-sm text-gray-600">Choose your wall color</span>
                      </div>
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg text-lg py-3" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your Wall
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 