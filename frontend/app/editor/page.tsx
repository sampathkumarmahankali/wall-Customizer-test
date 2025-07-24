"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import WallEditor from "@/components/wall/WallEditor";
import VoiceImageEditor from "@/components/ai/VoiceImageEditor";

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [initialSettings, setInitialSettings] = useState<any>(null);
  const [creatorId, setCreatorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(!!sessionId);
  const [shareType, setShareType] = useState<string | null>(null);
  const [editors, setEditors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      const currentUrl = window.location.pathname + window.location.search;
      router.replace(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [router]);

  useEffect(() => {
    if (sessionId) {
      setLoading(true);
      fetch(`${API_URL}/session/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setInitialSettings(data.data); // .data because backend returns { data: ... }
          setCreatorId(data.user_id);
          setLoading(false);
        });
      // Fetch share info
      fetch(`${API_URL}/shared/session/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => {
          if (res.status === 403) {
            setError('You do not have permission to edit this session.');
            setShareType(null);
            setEditors([]);
            setLoading(false);
            return null;
          }
          return res.ok ? res.json() : null;
        })
        .then(data => {
          if (data) {
            setShareType(data.type);
            setEditors(Array.isArray(data.editors) ? data.editors : (data.editors ? JSON.parse(data.editors) : []));
          } else if (!error) {
            setShareType(null);
            setEditors([]);
          }
        })
        .catch(() => {
          setShareType(null);
          setEditors([]);
        });
    }
  }, [sessionId]);

  if (loading) return <div>Loading session...</div>;
  if (error) return <div className="text-red-500 text-center font-semibold my-8">{error}</div>;

  // Get logged-in user id from localStorage
  let editable = false;
  if (!error) {
    if (shareType === 'public') {
      editable = true;
    } else if (shareType === 'private') {
      const loggedInUserEmail = localStorage.getItem('userEmail') || '';
      // Allow edit if user is in editors OR is the creator
      const sessionCreatorEmail = initialSettings?.creatorEmail || localStorage.getItem('userEmail') || '';
      editable = editors.includes(loggedInUserEmail);
    } else {
      // Fallback: only the creator (by email) can edit
      const loggedInUserEmail = localStorage.getItem('userEmail') || '';
      // Fallback: use localStorage if creatorEmail is missing
      const sessionCreatorEmail = initialSettings?.creatorEmail || localStorage.getItem('userEmail') || '';
      editable = loggedInUserEmail && sessionCreatorEmail && loggedInUserEmail === sessionCreatorEmail;
    }
  }

  return (
    <WallEditor initialSettings={initialSettings} editable={editable} />
  );
} 