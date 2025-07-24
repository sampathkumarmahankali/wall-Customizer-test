"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, Clock, Palette, LogOut, Home, ChevronDown, CheckCircle, Star, Award } from "lucide-react";
import ProfileForm from "@/components/auth/ProfileForm";
import ProfilePhotoUpload from "@/components/auth/ProfilePhotoUpload";
import SessionList from '../../components/profile/SessionList';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import Footer from "@/components/shared/Footer";
import { authenticatedFetch } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log('DEBUG: NEXT_PUBLIC_API_URL =', API_URL);

// Session data type
interface Session {
  id: string;
  name: string;
  updatedAt: string;
}

// Add Plan interface for type safety
interface Plan {
  id: number;
  name: string;
  price: number;
  features: string[];
  session_limit: number;
}

const fetchUserIdByEmail = async (email: string): Promise<string | null> => {
  const res = await fetch(`${API_URL}/auth/userid-by-email/${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.userId;
};

const fetchUserSessions = async (userId: string): Promise<Session[]> => {
  if (!userId) return [];
  const res = await fetch(`${API_URL}/sessions/${userId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((s: any) => ({
    id: s.id.toString(),
    name: s.name,
    updatedAt: s.updated_at,
  }));
};

// Add a helper for INR formatting
const formatINR = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

export default function ProfilePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [plan, setPlan] = useState<string>("");
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [planError, setPlanError] = useState("");
  const [planDetails, setPlanDetails] = useState<Plan[]>([]);
  const [pendingPlanRequest, setPendingPlanRequest] = useState<null | { requested_plan: string, status: string }>(null);
  
  // Get user email for avatar fallback
  let email = "";
  if (typeof window !== "undefined") {
    email = localStorage.getItem("userEmail") || "";
  }

  useEffect(() => {
    const loadData = async () => {
      if (!email) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch sessions
        const userId = await fetchUserIdByEmail(email);
        if (userId) {
          const sessionData = await fetchUserSessions(userId);
          setSessions(sessionData);
        }

        // Fetch profile photo and role
        const token = localStorage.getItem("token");
        if (token) {
          const profileResponse = await fetch(`${API_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            // Use profilePhotoUrl (S3) if available, else fallback to profile_photo
            if (profileData.user && (profileData.user.profilePhotoUrl || profileData.user.profile_photo)) {
              setProfilePhoto(profileData.user.profilePhotoUrl || profileData.user.profile_photo);
            }
            if (profileData.user && profileData.user.role === "admin") {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [email]);

  // Calculate active projects (sessions updated in the last 1 day)
  const getActiveProjects = () => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.updatedAt);
      return sessionDate > oneDayAgo;
    }).length;
  };

  // Get total sessions count
  const getTotalSessions = () => sessions.length;

  // Get account status (basic logic - can be enhanced)
  const getAccountStatus = () => {
    if (sessions.length >= 10) return "Premium";
    if (sessions.length >= 5) return "Pro";
    return "Basic";
  };

  // Fetch user's plan (add to useEffect)
  useEffect(() => {
    const fetchPlan = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.plan) setPlan(data.user.plan);
        }
      } catch {}
    };
    fetchPlan();
  }, []);

  useEffect(() => {
    // Fetch plan details from backend
    fetch(`${API_URL}/plans`)
      .then(res => res.json())
      .then(data => {
        const plans = Array.isArray(data.plans) ? data.plans : [];
        // Ensure features is always an array
        const normalized = plans.map((p: any) => ({
          ...p,
          features: Array.isArray(p.features)
            ? p.features
            : (typeof p.features === 'string' ? JSON.parse(p.features) : []),
        }));
        setPlanDetails(normalized);
      })
      .catch(() => setPlanDetails([]));
  }, []);

  useEffect(() => {
    // Fetch user's pending plan change request
    const fetchPendingPlanRequest = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/auth/user/plan-change-request`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPendingPlanRequest(data.request || null);
        } else {
          setPendingPlanRequest(null);
        }
      } catch {
        setPendingPlanRequest(null);
      }
    };
    fetchPendingPlanRequest();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  const handleLogoClick = () => {
    router.push("/create");
  };


  const handlePhotoUpdate = (photoPath: string) => {
    setProfilePhoto(photoPath);
  };

  // Add handler to update plan
  const handlePlanSelect = async (selectedPlan: string) => {
    setPlanError("");
    setPlanSuccess("");
    // Downgrade check
    if (planDetails && planDetails.length > 0) {
      const currentPlan = planDetails.find(p => p.name.toLowerCase() === selectedPlan);
      if (currentPlan && sessions.length > currentPlan.session_limit) {
        setPendingPlan(selectedPlan);
        setShowConfirmDowngrade(true);
        return;
      }
    }
    await doPlanUpdate(selectedPlan);
  };

  const doPlanUpdate = async (selectedPlan: string) => {
    setUpdatingPlan(true);
    setPlanError("");
    setPlanSuccess("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/auth/update-plan`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      if (res.ok) {
        setPlan(selectedPlan);
        setShowPlanModal(false);
        setPlanSuccess("Plan updated successfully!");
        setShowConfirmDowngrade(false);
      } else {
        const data = await res.json();
        setPlanError(data.message || "Failed to update plan.");
      }
    } catch {
      setPlanError("Network error.");
    } finally {
      setUpdatingPlan(false);
    }
  };

  // Plan limits and benefits
  // Remove static PLAN_LIMITS and PLAN_BENEFITS

  const [showConfirmDowngrade, setShowConfirmDowngrade] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string>("");
  const [planSuccess, setPlanSuccess] = useState("");
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  useEffect(() => {
    if (searchParams && searchParams.get('showPlans') === '1') {
      setShowPlanModal(true);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] relative overflow-x-hidden"> {/* Light gold/cream background */}
      {/* Decorative background shapes */}
      <div className="absolute -top-8 -left-8 w-64 h-64 bg-[#FFD700]/30 rounded-3xl rotate-6 z-0 pointer-events-none" /> {/* Gold */}
      <div className="absolute bottom-20 -right-8 w-32 h-32 bg-[#A0522D]/20 rounded-full z-0 pointer-events-none" /> {/* Brown */}
      <div className="absolute top-24 right-24 w-24 h-24 bg-[#C71585]/20 rounded-full z-0 pointer-events-none" /> {/* Rose */}
      <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-[#8e44ad]/20 rounded-full z-0 pointer-events-none" /> {/* Purple */}
      <div className="flex-1 relative z-10">
        {/* Main Content */}
        <div className="p-4 pt-0">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFD700] to-[#8e44ad] bg-clip-text text-transparent mb-2">
                Profile Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Manage your account and design sessions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card - Left */}
              <div className="lg:col-span-1">
                <Card className="bg-[#FFF9F3] border border-gray-200 shadow rounded-2xl overflow-hidden"> {/* Soft light gold/cream background */}
                  <div className="p-6 flex flex-col items-center justify-center">
                      <ProfilePhotoUpload
                        currentPhoto={profilePhoto}
                        userEmail={email}
                        onPhotoUpdate={handlePhotoUpdate}
                      />
                    <div className="text-center mt-2">
                      <h2 className="text-2xl font-bold mb-1 text-gray-800">Welcome Back!</h2>
                      <p className="text-gray-500">{email}</p>
                    </div>
                  </div>
                  <CardContent className="p-6 bg-[#FFF9F3] rounded-b-2xl"> {/* Soft light gold/cream background */}
                    <ProfileForm />
                  </CardContent>
                </Card>
              </div>

              {/* Sessions Card - Right */}
              <div className="lg:col-span-2">
                <Card className="bg-[#FFF9F3] border border-gray-200 shadow rounded-2xl"> {/* Soft light gold/cream background */}
                  <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Palette className="h-6 w-6 text-orange-400" />
                      </div>
                      <div>
                      <h2 className="text-2xl font-bold text-gray-800">Design Sessions</h2>
                      <p className="text-gray-500">Continue your creative projects</p>
                    </div>
                  </div>
                  <CardContent className="p-6 bg-[#FFF9F3] rounded-b-2xl"> {/* Soft light gold/cream background */}
                    <SessionList />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="bg-[#FFF9F3] text-gray-900 border border-gray-200 shadow rounded-2xl"> {/* Soft light gold/cream background */}
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/30 rounded-lg">
                      <Clock className="h-6 w-6 text-[#A0522D]" />
                    </div>
                    <div>
                      <p className="text-[#A0522D] text-sm">Total Sessions</p>
                      <p className="text-2xl font-bold">
                        {loading ? "..." : getTotalSessions()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#FFF9F3] text-gray-900 border border-gray-200 shadow rounded-2xl"> {/* Soft light gold/cream background */}
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/30 rounded-lg">
                      <Settings className="h-6 w-6 text-[#8e44ad]" />
                    </div>
                    <div>
                      <p className="text-[#8e44ad] text-sm">Active Projects</p>
                      <p className="text-2xl font-bold">
                        {loading ? "..." : getActiveProjects()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#FFF9F3] text-gray-900 border border-gray-200 shadow rounded-2xl cursor-pointer" 
  onClick={() => {
    if (pendingPlanRequest && pendingPlanRequest.status === 'pending') {
      toast.warning('You have a pending plan change request. Please wait for admin approval.');
    } else {
      setShowPlanModal(true);
    }
  }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/30 rounded-lg">
                      <User className="h-6 w-6 text-[#C71585]" />
                    </div>
                    <div>
                      <p className="text-[#C71585] text-sm">Account Status</p>
                      <p className="text-2xl font-bold">
                        {loading ? "..." : plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : getAccountStatus()}
                      </p>
                    </div>
                  </div>
                  {/* Plan status and pending request */}
                  {pendingPlanRequest && pendingPlanRequest.status === 'pending' ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">Request Pending</Badge>
                      <span className="text-sm text-gray-500">Your plan change is awaiting admin approval.</span>
                    </div>
                  ) : (
                    <>
                      {pendingPlanRequest && pendingPlanRequest.status === 'pending' && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">Waiting for admin approval</Badge>
                          <span className="text-sm text-gray-500">Requested: {pendingPlanRequest.requested_plan}</span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {/* Plan Selection Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-2xl mx-auto">
          <DialogHeader>
            <DialogTitle>Choose Your Plan</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="mb-2 text-center text-gray-700 text-lg font-semibold">
              Select the plan that best fits your needs
            </div>
            {pendingPlanRequest && pendingPlanRequest.status === 'pending' ? (
              <div className="text-center text-orange-600 font-semibold py-8">
                You have a pending plan change request.<br />
                Please wait for admin approval before making another change.
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 justify-center items-stretch">
                {Array.isArray(planDetails) && planDetails.length > 0 ? (
                  planDetails
                    .sort((a, b) => a.price - b.price)
                    .map((p) => (
                      <div
                        key={p.id}
                        className={`flex-1 border-2 rounded-2xl p-4 shadow-lg transition-transform duration-200 bg-white relative group cursor-pointer ${plan === p.name.toLowerCase() ? `border-blue-500 scale-105 bg-blue-50` : 'border-gray-200 hover:scale-105 hover:shadow-2xl'}`}
                        onClick={() => !updatingPlan && plan !== p.name.toLowerCase() && handlePlanSelect(p.name.toLowerCase())}
                      >
                        {plan === p.name.toLowerCase() && (
                          <span className="absolute top-4 right-4 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow">Current Plan</span>
                        )}
                        <h3 className="text-2xl font-bold mb-2 text-blue-700 flex items-center gap-2">{p.name}</h3>
                        <div className="text-3xl font-bold mb-2">{formatINR(Number(p.price))}</div>
                        <div className="text-gray-600 mb-2">Session Limit: {p.session_limit}</div>
                        <ul className="text-base mb-2 list-none space-y-2">
                          {(Array.isArray(p.features) ? p.features : []).map((b: string, i: number) => (
                            <li key={i} className="flex items-center gap-2 text-blue-800"><CheckCircle className="h-5 w-5 text-blue-400" />{b}</li>
                          ))}
                        </ul>
                        <div className="mt-auto">
                          {plan !== p.name.toLowerCase() && <Button className="w-full" disabled={!!(updatingPlan || (pendingPlanRequest && pendingPlanRequest.status === 'pending'))}>Choose {p.name}</Button>}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center text-gray-500">No plans available.</div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Downgrade confirmation dialog */}
      <Dialog open={showConfirmDowngrade} onOpenChange={setShowConfirmDowngrade}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Confirm Downgrade</DialogTitle>
          </DialogHeader>
          <div className="text-gray-700 mb-4">
            You currently have <span className="font-semibold">{sessions.length}</span> sessions, but the <span className="font-semibold">{pendingPlan.charAt(0).toUpperCase() + pendingPlan.slice(1)}</span> plan allows only <span className="font-semibold">{planDetails && planDetails.length > 0 ? planDetails.find(p => p.name.toLowerCase() === pendingPlan)?.session_limit || 3 : 3}</span>.<br />
            Please delete or export your sessions to downgrade.
          </div>
          <Button className="w-full" variant="outline" onClick={() => setShowConfirmDowngrade(false)}>Cancel</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
} 