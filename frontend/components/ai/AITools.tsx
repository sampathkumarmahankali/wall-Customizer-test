"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Wand2, 
  ImageIcon,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import VoiceImageEditor from "@/components/ai/VoiceImageEditor";

interface ToolsProps {
  selectedImage: any;
  onImageUpdate: (updatedImage: any) => void;
  images: any[];
}

export default function Tools({ 
  selectedImage, 
  onImageUpdate,
  images 
}: ToolsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<'removeBg' | 'voiceEditor'>('removeBg');

  React.useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/status`);
      const data = await response.json();
      setAiStatus(data.status);
    } catch (error) {
      // No debugging
    }
  };

  const handleBackgroundRemoval = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsProcessing(true);
    setProcessingType("background-removal");

    try {
      // Convert base64 to blob
      const response = await fetch(selectedImage.src);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');

      const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/remove-background`, {
        method: 'POST',
        body: formData
      });

      const result = await aiResponse.json();

      if (result.success) {
        const updatedImage = {
          ...selectedImage,
          src: result.image,
          originalSrc: result.image
        };
        onImageUpdate(updatedImage);
        toast.success("Background removed successfully!");
      } else {
        throw new Error(result.error || 'Failed to remove background');
      }
    } catch (error) {
      toast.error("Failed to remove background. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingType("");
    }
  };

  const isServiceAvailable = (service: string) => {
    return aiStatus && aiStatus[service];
  };

  return (
    <>
      <div className="flex gap-2 mb-4">
        <button
          className={`flex-1 px-2 py-1 rounded text-xs font-semibold border transition-colors ${activeTool === 'removeBg' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
          onClick={() => setActiveTool('removeBg')}
        >
          Remove Background
        </button>
        <button
          className={`flex-1 px-2 py-1 rounded text-xs font-semibold border transition-colors ${activeTool === 'voiceEditor' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
          onClick={() => setActiveTool('voiceEditor')}
        >
          Voice Editor
        </button>
      </div>
      {activeTool === 'removeBg' && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Remove Background
            </CardTitle>
            <CardDescription>
              Enhance your images with smart background removal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Background Removal</span>
                <Badge variant={isServiceAvailable('removeBg') ? "default" : "secondary"}>
                  {isServiceAvailable('removeBg') ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <Button 
                onClick={handleBackgroundRemoval}
                disabled={!selectedImage || !isServiceAvailable('removeBg') || isProcessing}
                className="w-full"
              >
                {isProcessing && processingType === "background-removal" ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                    Removing Background...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Remove Background
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Remove.bg API key required for background removal
              </p>
            </div>
            {isProcessing && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Processing...
                  </span>
                </div>
                <Progress value={33} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {activeTool === 'voiceEditor' && (
        <div className="mt-0">
          <VoiceImageEditor image={selectedImage} onImageUpdate={onImageUpdate} />
        </div>
      )}
    </>
  );
} 