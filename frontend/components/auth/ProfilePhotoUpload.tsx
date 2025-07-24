"use client";

import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Camera, X, Upload } from "lucide-react";
import { getAuthHeadersForFormData } from "@/lib/auth";

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  userEmail: string;
  onPhotoUpdate?: (photoPath: string) => void;
  onPhotoSelect?: (file: File) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to construct photo URL
const getPhotoUrl = (photoPath: string | undefined) => {
  if (!photoPath) return undefined;
  
  // If it's already a data URL (base64), return as is
  if (photoPath.startsWith('data:')) {
    return photoPath;
  }
  
  // If it's already a full URL, return as is
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  
  // If it's a relative path, prefix with backend server URL
  if (photoPath.startsWith('/uploads/')) {
    return `${API_URL}${photoPath}`;
  }
  
  return photoPath;
};

// Helper function to upload profile photo using FormData
const uploadProfilePhoto = async (file: File) => {
  try {
    const headers = getAuthHeadersForFormData();
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_URL}/auth/upload-profile-photo`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload photo');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export default function ProfilePhotoUpload({ 
  currentPhoto, 
  userEmail, 
  onPhotoUpdate,
  onPhotoSelect 
}: ProfilePhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    setError("");
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    try {
      const response = await uploadProfilePhoto(file);
      if (response.profilePhotoUrl && onPhotoUpdate) {
        onPhotoUpdate(response.profilePhotoUrl);
      }
      if (onPhotoSelect) {
        onPhotoSelect(file);
      }
    } catch (error) {
      setError('Failed to upload photo. Please try again.');
    }
  };

  const handleRemovePhoto = async () => {
    try {
      // Clear local state
      setSelectedFile(null);
      setPreviewUrl(null);
      setError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // If there's a current photo, remove it from backend
      if (currentPhoto) {
        const headers = getAuthHeadersForFormData();
        const response = await fetch(`${API_URL}/auth/remove-profile-photo`, {
          method: 'DELETE',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Update parent component to clear the photo
          if (onPhotoUpdate) {
            onPhotoUpdate('');
          }
        } else {
          // Failed to remove profile photo from backend
        }
      }
    } catch (error) {
      setError('Failed to remove photo. Please try again.');
    }
  };

  // Determine what to show in the avatar
  const getAvatarContent = () => {
    if (previewUrl) {
      return <AvatarImage src={previewUrl} alt="Profile preview" className="object-cover" />;
    }
    if (currentPhoto) {
      return <AvatarImage src={currentPhoto} alt="Profile photo" className="object-cover" />;
    }
    return null;
  };

  const getAvatarFallback = () => {
    if (userEmail) {
      return userEmail[0].toUpperCase();
    }
    return <User className="h-12 w-12" />;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Section */}
      <div className="relative group">
        <Avatar 
          className="h-24 w-24 border-4 border-white/20 cursor-pointer transition-all duration-200 group-hover:border-white/40 group-hover:scale-105"
          onClick={handleAvatarClick}
        >
          {getAvatarContent()}
          <AvatarFallback className="text-2xl bg-white/20 text-white">
            {getAvatarFallback()}
          </AvatarFallback>
        </Avatar>
        
        {/* Camera overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
          <Camera className="h-8 w-8 text-white" />
        </div>
        
        {/* Remove button for preview */}
        {previewUrl && (
          <button
            onClick={handleRemovePhoto}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors duration-200"
            title="Remove selected photo"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200 max-w-xs">
          <div className="flex items-center gap-2">
            <X className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleAvatarClick}
          variant="outline"
          size="sm"
          className="text-xs border-gray-300 hover:bg-gray-50 text-gray-700"
        >
          <Camera className="mr-2 h-3 w-3" />
          {currentPhoto || previewUrl ? "Change Photo" : "Add Photo"}
        </Button>
      </div>

      {/* Preview info */}
      {previewUrl && selectedFile && (
        <div className="text-xs text-gray-500 text-center">
          <p>Selected: {selectedFile.name}</p>
          <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}
    </div>
  );
} 