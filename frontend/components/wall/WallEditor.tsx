"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Settings, ImageIcon, Download, Edit, Save, ClipboardCopy, Sparkles } from "lucide-react";
import Wall from "@/components/wall";
import ImageBlock from "@/components/image-block";
import WallSettings from "@/components/wall-settings";
import ExportDialog from "@/components/export-dialog";
import ImageEditor from "@/components/image-editor";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import Tools from "@/components/ai/AITools";
import { authenticatedFetch } from "@/lib/auth";
import { createSharedSession } from '@/lib/shared';
import { getToken } from '@/lib/auth';

interface WallEditorProps {
  initialSettings?: any;
  editable?: boolean;
}

// Utility to convert File to base64 string
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function WallEditor({ initialSettings, editable = true }: WallEditorProps) {
  // --- State Variables ---
  const [images, setImages] = useState<any[]>([]);
  const [wallSize, setWallSize] = useState({ width: 600, height: 400 });
  const [wallBackground, setWallBackground] = useState({ name: "Blank White Wall", value: "#ffffff", backgroundSize: "auto" });
  const [wallColor, setWallColor] = useState("#ffffff");
  const [customBackgrounds, setCustomBackgrounds] = useState([]);
  const [wallBorder, setWallBorder] = useState<{ width: number; color: string; style: 'solid' | 'dashed' | 'dotted' | 'double'; radius: number }>({ width: 0, color: "#000000", style: "solid", radius: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const wallRef = useRef(null);
  const [showSampleDialog, setShowSampleDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showTools, setShowTools] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const userId = localStorage.getItem("userId");
  const [shareStatus, setShareStatus] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareType, setShareType] = useState<'view' | 'public' | 'private'>('view');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedEditors, setSelectedEditors] = useState<string[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [planLimit, setPlanLimit] = useState<number | null>(null);
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [plan, setPlan] = useState<string>('basic');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  // Add state for plan features
  const [planFeatures, setPlanFeatures] = useState({
    edit_image_enabled: true,
    tools_enabled: true,
    export_enabled: true,
    max_decors: 10,
  });

  // Remove static sampleImages
  const [decorCategories, setDecorCategories] = useState<any[]>([]);
  const [decorItems, setDecorItems] = useState<any[]>([]);
  const [loadingDecors, setLoadingDecors] = useState(true);
  const [selectedDecorCategory, setSelectedDecorCategory] = useState<string | null>(null);

  // Fetch decor categories and items
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/decor-categories`)
      .then(res => res.json())
      .then(data => setDecorCategories(data.categories || []));
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/decors`)
      .then(res => res.json())
      .then(data => setDecorItems(data.decors || []))
      .finally(() => setLoadingDecors(false));
  }, []);

  // Group decors by category
  const decorsByCategory = decorCategories.map(cat => ({
    ...cat,
    decors: decorItems.filter((d: any) => d.category_id === cat.id && d.is_active)
  }));

  // Helper to get current timestamp
  const getTimestamp = () => new Date().toISOString();

  useEffect(() => {
    if (sessionId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/session/${sessionId}`)
        .then(res => res.json())
        .then(session => {
          if (session.data) {
            setWallSize(session.data.wallSize);
            setWallColor(session.data.wallColor);
            setWallBackground(session.data.background);
            setCustomBackgrounds(session.data.customBackgrounds || []);
            setWallBorder(session.data.wallBorder);
            // Restore session name
            if (session.name) {
              setSessionName(session.name);
            }
            // Restore images from blocks
            setImages(
              (session.data.blocks || []).map((block: any) => ({
                id: block.id,
                src: block.src,
                position: block.position,
                style: block.size ? { width: block.size.width, height: block.size.height } : undefined,
                borderStyle: block.border,
                background: block.background,
                zIndex: block.zIndex,
                shape: block.shape,
                frame: block.frame,
                filters: block.filters,
                transform: block.transform,
                // ...other properties as needed
              }))
            );
          }
        });
    } else {
      // Restore from localStorage or use defaults
      if (typeof window !== "undefined") {
        const settings = localStorage.getItem("wallSettings");
        if (settings) {
          const { wallSize, wallColor, wallBackground, customBackgrounds } = JSON.parse(settings);
          setWallSize(wallSize);
          setWallColor(wallColor);
          setWallBackground(wallBackground);
          setCustomBackgrounds(customBackgrounds || []);
        }
      }
      if (initialSettings) {
        setWallSize(initialSettings.wallSize);
        setWallColor(initialSettings.wallColor);
        setWallBackground(initialSettings.wallBackground);
        setCustomBackgrounds(initialSettings.customBackgrounds || []);
      }
    }
  }, [sessionId, initialSettings]);

  useEffect(() => {
    // Fetch user's plan and session count
    const fetchPlanAndSessions = async () => {
      const email = localStorage.getItem('userEmail');
      if (!email) return;
      // Get userId
      const userIdRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/userid-by-email/${encodeURIComponent(email)}`);
      const userIdData = await userIdRes.json();
      const userId = userIdData.userId;
      // Get session count
      const sessionsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${userId}`);
      const sessionsData = await sessionsRes.json();
      setSessionCount(Array.isArray(sessionsData) ? sessionsData.length : 0);
      // Get plan
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const profileData = await profileRes.json();
      const userPlan = profileData.user?.plan || 'basic';
      setPlan(userPlan.toLowerCase());
      // Get plan details
      const plansRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plans`);
      const plansData = await plansRes.json();
      const planObj = Array.isArray(plansData.plans) ? plansData.plans.find((p: any) => p.name.toLowerCase() === userPlan) : null;
      setPlanLimit(planObj?.session_limit ?? 3);
      setPlanFeatures({
        edit_image_enabled: planObj?.edit_image_enabled ?? true,
        tools_enabled: planObj?.tools_enabled ?? true,
        export_enabled: planObj?.export_enabled ?? true,
        max_decors: planObj?.max_decors ?? 10,
      });
    };
    fetchPlanAndSessions();
  }, []);

  // --- Handlers and Utility Functions ---

  // Handle image upload (add images to wall)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Convert all files to base64
    const imageObjs = await Promise.all(
      files.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          id: Date.now() + Math.random(),
          src: base64, // base64 string
          originalSrc: base64,
          style: {
            width: 200,
            height: 200,
          },
          position: { x: 50, y: 50 },
          filters: {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            hue: 0,
            blur: 0,
          },
          shape: "rectangle",
          frame: {
            type: "none",
            width: 0,
            color: "#8B4513",
          },
          borderStyle: {
            width: 0,
            color: "#000000",
            style: "solid",
          },
        };
      })
    );
    setImages((prev: any[]) => [...prev, ...imageObjs]);
  };

  // Update an image's properties by id
  const updateImage = (id: number, updates: any) => {
    setImages((prev: any[]) =>
      prev.map((img: any) => (img.id === id ? { ...img, ...updates, style: { ...img.style, ...updates.style } } : img))
    );
  };

  // Start editing an image
  const handleEditImage = (imageId: number) => {
    setEditingImageId(imageId);
    const image = images.find(img => img.id === imageId);
    setSelectedImage(image);
  };

  // Handle AI image update
  const handleAIUpdate = (updatedImage: any) => {
    updateImage(updatedImage.id, updatedImage);
    setSelectedImage(updatedImage);
  };

  // Delete an image from the wall
  const deleteImage = (id: number) => {
    setImages((prev: any[]) => prev.filter((img: any) => img.id !== id));
  };

  // Create a collage from selected images
  const createCollage = (selectedImages: any[]) => {
    if (selectedImages.length < 2) return;
    const collageImage = {
      id: Date.now() + Math.random(),
      src: selectedImages[0], // Use first image as preview
      originalSrc: selectedImages[0],
      style: {
        width: 300,
        height: 300,
      },
      position: { x: 100, y: 100 },
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        blur: 0,
      },
      shape: "rectangle",
      frame: {
        type: "classic",
        width: 8,
        color: "#8B4513",
      },
      borderStyle: {
        width: 0,
        color: "#000000",
        style: "solid",
      },
      isCollage: true,
      collageImages: selectedImages,
    };
    setImages((prev: any[]) => [...prev, collageImage]);
  };

  // Get current wall background value (use wall color if blank white wall is selected)
  const currentWallBackground = wallBackground.name === "Blank White Wall" ? wallColor : wallBackground.value;

  // Handler to add a sample image to the wall
  const handleAddSampleImage = async (src: string) => {
    let base64Src = src;
    // If src is not base64, fetch and convert to base64 using backend proxy
    if (!src.startsWith('data:')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/proxy-image?url=${encodeURIComponent(src)}`);
        const blob = await response.blob();
        base64Src = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        // fallback to original src if fetch fails
        base64Src = src;
      }
    }
    const newImg = {
      id: Date.now() + Math.random(),
      src: base64Src,
      originalSrc: base64Src,
      style: { width: 200, height: 200 },
      position: { x: 50, y: 50 },
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        blur: 0,
      },
      shape: "rectangle",
      frame: {
        type: "none",
        width: 0,
        color: "#8B4513",
      },
      borderStyle: {
        width: 0,
        color: "#000000",
        style: "solid",
      },
    };
    setImages((prev: any[]) => [...prev, newImg]);
    setShowSampleDialog(false);
  };

  // Save session with robust wall layout structure
  const handleSaveSession = async () => {
    // Restrict if session count >= plan limit
    if (planLimit !== null && sessionCount !== null && sessionCount >= planLimit && !sessionId) {
      setShowLimitModal(true);
      return;
    }
    setSaveStatus("Saving...");
    const email = localStorage.getItem("userEmail");
    let name = sessionName.trim();
    
    // Compose blocks array from images
    const blocks = images.map(img => ({
      id: img.id,
      src: img.src, // should be a persistent URL or base64
      position: img.position,
      size: img.style ? { width: img.style.width, height: img.style.height } : undefined,
      border: img.borderStyle,
      background: img.background,
      zIndex: img.zIndex,
      shape: img.shape,
      frame: img.frame,
      filters: img.filters,
      transform: img.transform,
      timestamp: getTimestamp(),
      userId: userId ? parseInt(userId) : undefined,
    }));
    
    const payload = {
      email,
      name,
      sessionId: sessionId || undefined, // Include sessionId if editing existing session
      data: {
        wallSize,
        orientation: wallSize.width > wallSize.height ? "landscape" : "portrait",
        background: wallBackground,
        blocks,
        customBackgrounds,
        wallBorder,
        wallColor,
      },
    };
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        setSaveStatus(sessionId ? "Session updated!" : "Session saved!");
        // If this was a new session, update the URL with the new sessionId
        if (!sessionId && result.sessionId) {
          const newUrl = `${window.location.pathname}?sessionId=${result.sessionId}`;
          window.history.replaceState({}, '', newUrl);
        }
        // Trigger activity alert email
        try {
          await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/email/send-activity-alert`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              activityType: sessionId ? "Session Updated" : "Session Saved",
              activityDetails: `Session: ${name || "Untitled"}, Time: ${getTimestamp()}`,
            }),
          });
        } catch (err) {
          // Optionally handle error (e.g., show toast)
        }
      } else {
        setSaveStatus(result.error || "Failed to save session.");
      }
    } catch (err) {
      setSaveStatus("Network error.");
    }
    setTimeout(() => setSaveStatus(""), 1500);
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setShareStatus("Link copied!");
      setTimeout(() => {
        setShareStatus("");
        setShareLink("");
      }, 2000);
    }
  };

  // Fetch users for private sharing
  const fetchUsers = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const users = await res.json();
      setAllUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      setAllUsers([]);
    }
  };

  useEffect(() => {
    if (showShareDialog && shareType === 'private') {
      fetchUsers();
    }
  }, [showShareDialog, shareType]);

  // When shareType changes to 'private', add creator email to selectedEditors if not present
  useEffect(() => {
    if (shareType === 'private') {
      // Try to get creator email from initialSettings or localStorage
      const creatorEmail = initialSettings?.creatorEmail || localStorage.getItem('userEmail') || '';
      if (creatorEmail && !selectedEditors.includes(creatorEmail)) {
        setSelectedEditors(prev => [...prev, creatorEmail]);
      }
    }
    // Optionally, remove creator email if shareType is not private
    // else if (shareType !== 'private') {
    //   const creatorEmail = initialSettings?.creatorEmail || localStorage.getItem('userEmail') || '';
    //   setSelectedEditors(prev => prev.filter(email => email !== creatorEmail));
    // }
  }, [shareType, initialSettings]);

  const handleOpenShareDialog = () => {
    setShowShareDialog(true);
    setShareType('view');
    setSelectedEditors([]);
    setShareStatus("");
    setShareLink("");
  };

  const handleShareSubmit = async () => {
    if (!sessionId) {
      setShareStatus("Please save your wall first!");
      setShareLink("");
      setTimeout(() => setShareStatus(""), 2000);
      return;
    }
    setShareStatus("Sharing...");
    setShareLink("");
    try {
      let type = shareType === 'view' ? 'view' : shareType;
      let editors = shareType === 'private' ? selectedEditors : [];
      let viewers: string[] = [];
      const res = await createSharedSession({ session_id: sessionId, type, editors, viewers });
      if (res && res.id) {
        let url = '';
        if (type === 'view') {
          url = `${window.location.origin}/altar/${sessionId}?shared=1&type=${type}`;
        } else {
          url = `${window.location.origin}/editor?sessionId=${sessionId}`;
        }
        setShareLink(url);
        setShareStatus("Shared! Copy the link below.");
      } else {
        setShareStatus("Failed to share session.");
      }
    } catch (err: any) {
      setShareStatus(err.message || "Failed to share session.");
    }
  };

  // Search users by email
  const searchUsers = async (email: string) => {
    if (!email) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?email=${encodeURIComponent(email)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const users = await res.json();
      setSearchResults(users);
    } catch (err) {
      setSearchResults([]);
    }
    setSearching(false);
  };

  // If not editable, disable editing features
  const isEditable = editable;

  // Helper to open plan selection on profile page
  const goToPlans = () => {
    window.location.href = '/profile?showPlans=1';
  };

  // --- Render ---
  return (
    <div className="bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] relative"> {/* Light gold/cream background */}
      {/* Decorative background shapes */}
      <div className="absolute top-20 -left-8 w-64 h-64 bg-[#FFD700]/30 rounded-3xl rotate-6 z-0 pointer-events-none" /> {/* Gold */}
      <div className="absolute -bottom-8 right-8 w-32 h-32 bg-[#A0522D]/20 rounded-full z-0 pointer-events-none" /> {/* Brown */}
      <div className="absolute top-32 right-24 w-24 h-24 bg-[#C71585]/20 rounded-full z-0 pointer-events-none" /> {/* Rose */}
      <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-[#8e44ad]/20 rounded-full z-0 pointer-events-none" /> {/* Purple */}
      <div className="relative z-10">
        {/* Sticky Header */}
        {/* Remove the sticky header div at the top. Only use the global header from LayoutWithHeader. */}

        <div className="max-w-7xl mx-auto p-2">
          {/* Enhanced floating toolbar */}
          <div className="mb-4 justify-center hidden sm:flex">
            <div className="backdrop-blur-xl bg-white/60 shadow-2xl rounded-full px-6 py-3 flex gap-3 items-center border border-[#FFD700]/20" style={{ minWidth: 320, maxWidth: 900 }}>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full px-5 py-2 font-semibold bg-white/70 text-gray-700 border border-gray-300/50 shadow-sm hover:bg-white/90 hover:text-gray-900 hover:border-gray-300 transition-all flex items-center gap-2"
              >
                <Upload className="h-5 w-5" /> Add Images
              </Button>
              <Button
                onClick={() => setShowSampleDialog(true)}
                className="rounded-full px-5 py-2 font-semibold bg-white/70 text-gray-700 border border-gray-300/50 shadow-sm hover:bg-white/90 hover:text-gray-900 hover:border-gray-300 transition-all flex items-center gap-2"
              >
                <ImageIcon className="h-5 w-5" /> Decors
              </Button>
              <Button
                onClick={() => {
                  if (!planFeatures.edit_image_enabled) {
                    setShowUpgradeModal(true);
                  } else {
                    setShowImageEditor(!showImageEditor);
                  }
                }}
                className="rounded-full px-5 py-2 font-semibold bg-white/70 text-gray-700 border border-gray-300/50 shadow-sm hover:bg-white/90 hover:text-gray-900 hover:border-gray-300 transition-all flex items-center gap-2"
              >
                <Edit className="h-5 w-5" /> {showImageEditor ? "Hide" : "Edit"} Images
              </Button>
              <Button
                onClick={() => {
                  if (!planFeatures.tools_enabled) {
                    setShowUpgradeModal(true);
                  } else if (plan === 'basic') {
                    setShowUpgradeModal(true);
                  } else {
                    setShowTools(!showTools);
                  }
                }}
                className="rounded-full px-5 py-2 font-semibold bg-white/70 text-gray-700 border border-gray-300/50 shadow-sm hover:bg-white/90 hover:text-gray-900 hover:border-gray-300 transition-all flex items-center gap-2"
              >
                <Sparkles className="h-5 w-5" /> Tools
              </Button>
              <Button
                onClick={() => {
                  if (!planFeatures.export_enabled) {
                    setShowUpgradeModal(true);
                  } else if (plan === 'basic') {
                    setShowUpgradeModal(true);
                  } else {
                    setShowExportDialog(true);
                  }
                }}
                className="rounded-full px-5 py-2 font-semibold bg-white/70 text-gray-700 border border-gray-300/50 shadow-sm hover:bg-white/90 hover:text-gray-900 hover:border-gray-300 transition-all flex items-center gap-2"
              >
                <Download className="h-5 w-5" /> Export
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                className="rounded-full px-5 py-2 font-semibold bg-white/70 text-gray-700 border border-gray-300/50 shadow-sm hover:bg-white/90 hover:text-gray-900 hover:border-gray-300 transition-all flex items-center gap-2"
              >
                <Settings className="h-5 w-5" /> Wall Settings
              </Button>
            </div>
          </div>
          {/* Mobile Navigation Menu */}
          <nav className="fixed bottom-0 left-0 w-full z-50 flex sm:hidden bg-gradient-to-r from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] border-t border-[#FFD700]/30 shadow-2xl px-2 py-1 justify-between items-center">
            <button className="flex flex-col items-center flex-1 py-2" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-7 w-7 mb-1 text-[#8e44ad]" />
              <span className="text-xs font-semibold">Add</span>
            </button>
            <button className="flex flex-col items-center flex-1 py-2" onClick={() => setShowSampleDialog(true)}>
              <ImageIcon className="h-7 w-7 mb-1 text-[#C71585]" />
              <span className="text-xs font-semibold">Decors</span>
            </button>
            <button className="flex flex-col items-center flex-1 py-2" onClick={() => setShowImageEditor(!showImageEditor)}>
              <Edit className="h-7 w-7 mb-1 text-[#FF9800]" />
              <span className="text-xs font-semibold">Edit</span>
            </button>
            <button className="flex flex-col items-center flex-1 py-2" onClick={() => {
              if (plan === 'basic') {
                setShowUpgradeModal(true);
              } else {
                setShowTools(!showTools);
              }
            }}>
              <Sparkles className="h-7 w-7 mb-1 text-[#FFD700]" />
              <span className="text-xs font-semibold">Tools</span>
            </button>
            <button className="flex flex-col items-center flex-1 py-2" onClick={() => {
              if (plan === 'basic') {
                setShowUpgradeModal(true);
              } else {
                setShowExportDialog(true);
              }
            }}>
              <Download className="h-7 w-7 mb-1 text-[#3b82f6]" />
              <span className="text-xs font-semibold">Export</span>
            </button>
            <button className="flex flex-col items-center flex-1 py-2" onClick={() => setShowSettings(true)}>
              <Settings className="h-7 w-7 mb-1 text-[#8e44ad]" />
              <span className="text-xs font-semibold">Settings</span>
            </button>
          </nav>

          {/* Hidden file input for image uploads */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          { !isEditable && (
            <div className="text-center text-red-500 font-semibold mb-4">You do not have permission to edit this wall. View only.</div>
          ) }

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Wall Area */}
            <div className={`${showImageEditor || showTools ? "lg:col-span-3" : "lg:col-span-4"}`}>
              {/* Main wall area card */}
              <Card className="shadow-2xl rounded-3xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30 backdrop-blur-lg relative overflow-hidden">
                {/* Decorative shapes inside card */}
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#FFD700]/30 rounded-3xl rotate-6 z-0 pointer-events-none" /> {/* Gold */}
                <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-[#A0522D]/20 rounded-full z-0 pointer-events-none" /> {/* Brown */}
                <div className="absolute top-10 right-10 w-12 h-12 bg-[#C71585]/20 rounded-full z-0 pointer-events-none" /> {/* Rose */}
                <div className="absolute bottom-4 left-1/2 w-10 h-10 bg-[#8e44ad]/20 rounded-full z-0 pointer-events-none" /> {/* Purple */}
                <CardContent className="p-1 relative z-10">
                  <div
                    ref={wallRef}
                    style={{
                      width: wallSize.width,
                      height: wallSize.height,
                      margin: "0 auto",
                      overflow: "hidden",
                      position: "relative",
                    }}
                    className="rounded-xl border border-gray-200 bg-gray-50 shadow-inner"
                  >
                    <Wall
                      width={wallSize.width}
                      height={wallSize.height}
                      background={currentWallBackground}
                      backgroundSize={wallBackground.backgroundSize}
                      border={wallBorder}
                    >
                      {images.map((img) => (
                        <ImageBlock
                          key={img.id}
                          image={img}
                          onUpdate={updateImage}
                          onEdit={() => handleEditImage(img.id)}
                          onDelete={() => deleteImage(img.id)}
                        />
                      ))}
                    </Wall>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Image Editor Sidebar */}
            {showImageEditor && (
              <div className="lg:col-span-1">
                <Card className="shadow-2xl rounded-3xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30 backdrop-blur-lg">
                  <CardContent className="p-3">
                    <ImageEditor
                      images={images}
                      editingImageId={editingImageId}
                      onSelectImage={setEditingImageId}
                      onUpdateImage={updateImage}
                      onCreateCollage={createCollage}
                      onDeleteImage={deleteImage}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* AI Tools Sidebar */}
            {showTools && (
              <div className="lg:col-span-1 space-y-4">
                <Card className="shadow-2xl rounded-3xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30 backdrop-blur-lg">
                  <CardContent className="p-3">
                    <Tools
                      selectedImage={selectedImage}
                      onImageUpdate={handleAIUpdate}
                      images={images}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Wall settings dialog */}
          {showSettings && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <WallSettings
                wallSize={wallSize}
                onWallSizeChange={setWallSize}
                wallBackground={wallBackground}
                wallColor={wallColor}
                onWallColorChange={setWallColor}
                onBackgroundChange={setWallBackground}
                customBackgrounds={customBackgrounds}
                onCustomBackgroundUpload={() => {}}
                onRemoveCustomBackground={() => {}}
                allBackgrounds={[wallBackground, ...customBackgrounds]}
                wallBorder={wallBorder}
                onWallBorderChange={setWallBorder}
                onClose={() => setShowSettings(false)}
              />
            </div>
          )}

          {/* Export dialog */}
          {showExportDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <ExportDialog
                wallRef={wallRef}
                wallSize={wallSize}
                wallBackground={wallBackground}
                wallBorder={wallBorder}
                images={images}
                onClose={() => setShowExportDialog(false)}
              />
            </div>
          )}
          {/* Upgrade modal for export */}
          {showUpgradeModal && (
            <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
              <DialogContent className="max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle>Upgrade Required</DialogTitle>
                </DialogHeader>
                <div className="text-center py-4">
                  <p className="mb-4 text-lg font-semibold text-gray-700">Exporting images is only available for Premium and Ultra users.</p>
                  <p className="mb-4 text-gray-600">Upgrade your plan to unlock export features and more!</p>
                  <div className="flex flex-col gap-2">
                    <Button className="w-full" variant="default" onClick={goToPlans}>Upgrade to Premium</Button>
                    <Button className="w-full" variant="secondary" onClick={goToPlans}>Upgrade to Ultra</Button>
                  </div>
                </div>
                <DialogClose asChild>
                  <Button variant="outline" className="w-full mt-2">Cancel</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          )}

          {/* Decors Dialog */}
          {showSampleDialog && (
            <Dialog open={showSampleDialog} onOpenChange={setShowSampleDialog}>
              <DialogContent className="max-w-2xl mx-auto">
                <DialogHeader>
                  <DialogTitle>Choose a Decor</DialogTitle>
                </DialogHeader>
                {loadingDecors ? (
                  <div>Loading decors...</div>
                ) : (
                  <div className="space-y-6">
                    {/* Decor type/category selector */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {decorsByCategory.map((cat, idx) => (
                        <Button
                          key={cat.id}
                          variant={selectedDecorCategory === cat.id ? 'default' : 'outline'}
                          className={selectedDecorCategory === cat.id ? 'font-bold border-primary' : ''}
                          onClick={() => setSelectedDecorCategory(cat.id)}
                        >
                          {cat.name}
                        </Button>
                      ))}
                    </div>
                    {/* Show only selected category's decors */}
                    {decorsByCategory.filter(cat => cat.id === selectedDecorCategory).map(cat => {
                      let decorsToShow = cat.decors;
                      if (planFeatures.max_decors && decorsToShow.length > planFeatures.max_decors) {
                        decorsToShow = decorsToShow.slice(0, planFeatures.max_decors);
                      }
                      return (
                        <div key={cat.id}>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 rounded-lg">
                            {decorsToShow.map((decor: any) => (
                              <div
                                key={decor.id}
                                className="border border-gray-200 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:shadow-lg transition bg-white hover:bg-blue-50"
                                onClick={() => handleAddSampleImage(decor.imageUrl || '/placeholder.jpg')}
                              >
                                <img src={decor.imageUrl || '/placeholder.jpg'} alt={decor.name} className="w-20 h-20 object-contain mb-2 rounded" />
                                <div className="text-sm text-center font-semibold">{decor.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <DialogClose asChild>
                  <Button variant="outline" className="w-full mt-4">Close</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          )}

          {/* Save Session card and Share button side by side */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-1 mt-2 mb-24 md:mb-0">
            {/* Save Session card */}
            <Card className="w-full max-w-lg p-3 flex flex-col items-center shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30 rounded-3xl backdrop-blur-lg">
              <div className="w-full mb-4 flex flex-col sm:flex-row items-center sm:items-end gap-4">
                <div className="flex-1 w-full">
                  <label htmlFor="sessionName" className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                    <Save className="h-4 w-4 text-blue-500" />
                    Session Name
                  </label>
                  <input
                    id="sessionName"
                    type="text"
                    value={sessionName}
                    onChange={e => setSessionName(e.target.value)}
                    placeholder="Enter session name"
                    className="w-full px-4 py-2 border border-blue-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm h-12"
                  />
                </div>
                <div className="hidden sm:block h-10 w-px bg-gray-200 mx-2" />
                <div className="flex flex-row gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleSaveSession}
                    disabled={!isEditable}
                    className="w-full sm:w-auto rounded-full px-6 h-12 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md transition flex items-center justify-center"
                    variant="default"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Session
                  </Button>
                </div>
              </div>
              {saveStatus && <div className="mt-2 text-green-600 text-sm font-medium">{saveStatus}</div>}
            </Card>
            {/* Share button as a separate card */}
            <Card className="w-full max-w-xs p-3 flex flex-col items-center shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30 rounded-3xl backdrop-blur-lg">
              <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogTrigger asChild>
              <Button
                variant="default"
                className="rounded-full px-6 h-12 font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md transition flex items-center justify-center"
                    onClick={handleOpenShareDialog}
              >
                Share
              </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg w-full mx-auto">
                  <DialogHeader>
                    <DialogTitle>Share this Altar</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex gap-2 justify-center">
                      <Button variant={shareType === 'view' ? 'default' : 'outline'} onClick={() => setShareType('view')}>View Only</Button>
                      <Button variant={shareType === 'public' ? 'default' : 'outline'} onClick={() => setShareType('public')}>Public (Anyone can edit)</Button>
                      <Button variant={shareType === 'private' ? 'default' : 'outline'} onClick={() => setShareType('private')}>Private (Select Editors)</Button>
                    </div>
                    {shareType === 'private' && (
                      <div>
                        <label className="block mb-1 font-medium">Add editor by email:</label>
                        <input
                          type="text"
                          className="w-full border rounded p-2 mb-2"
                          placeholder="Search by email..."
                          value={searchEmail}
                          onChange={e => {
                            setSearchEmail(e.target.value);
                            searchUsers(e.target.value);
                          }}
                        />
                        {searching && <div>Searching...</div>}
                        {!searching && searchResults.length > 0 && (
                          <ul className="border rounded bg-white max-h-32 overflow-y-auto">
                            {searchResults.map(user => (
                              <li
                                key={user.id}
                                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                  if (!selectedEditors.includes(user.email)) setSelectedEditors([...selectedEditors, user.email]);
                                  setSearchEmail('');
                                  setSearchResults([]);
                                }}
                              >
                                {user.name} ({user.email})
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedEditors.map(editorEmail => {
                            const user = allUsers.find(u => u.email === editorEmail);
                            return user ? (
                              <span key={editorEmail} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-1">
                                {user.name} ({user.email})
                                <button
                                  className="ml-1 text-red-500 hover:text-red-700"
                                  onClick={() => setSelectedEditors(selectedEditors.filter(email => email !== editorEmail))}
                                  type="button"
                                >
                                  &times;
                                </button>
                              </span>
                            ) : (
                              <span key={editorEmail} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-1">
                                {editorEmail}
                                <button
                                  className="ml-1 text-red-500 hover:text-red-700"
                                  onClick={() => setSelectedEditors(selectedEditors.filter(email => email !== editorEmail))}
                                  type="button"
                                >
                                  &times;
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <Button onClick={handleShareSubmit} className="w-full mt-2">Generate Share Link</Button>
              {shareLink && (
                <div className="flex items-center mt-4 w-full">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-2 py-1 border border-gray-300 rounded-l bg-gray-50 text-xs text-gray-700"
                    style={{ minWidth: 0 }}
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-r border-l border-gray-300 flex items-center"
                    title="Copy link"
                    type="button"
                  >
                    <ClipboardCopy className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              )}
              {shareStatus && <div className="mt-2 text-green-600 text-sm font-medium">{shareStatus}</div>}
                  </div>
                </DialogContent>
              </Dialog>
            </Card>
          </div>
        </div>
      </div>
      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Limit Reached</DialogTitle>
          </DialogHeader>
          <div className="text-center text-lg">You have reached your session limit for your current plan.<br/>Please upgrade your plan to save more sessions.</div>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setShowLimitModal(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 