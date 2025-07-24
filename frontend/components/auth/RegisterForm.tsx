"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface RegisterFormProps {
  onSuccess?: () => void;
  redirect?: string;
}

export default function RegisterForm({ onSuccess, redirect }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifError, setVerifError] = useState("");
  const [verifLoading, setVerifLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string>("");
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user is verified
        try {
          const checkRes = await fetch(`${API_URL}/auth/check-verified?email=${encodeURIComponent(email)}`);
          const checkData = await checkRes.json();
          if (checkRes.ok && checkData.is_verified) {
            // User is already verified (should not happen for new users)
            // Log in and redirect
            const loginRes = await fetch(`${API_URL}/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });
            const loginData = await loginRes.json();
            if (loginRes.ok && loginData.token) {
              localStorage.setItem("token", loginData.token);
              localStorage.setItem("userEmail", email);
              if (loginData.user && loginData.user.id) {
                localStorage.setItem("userId", loginData.user.id.toString());
              }
              if (loginData.user && loginData.user.name) {
                localStorage.setItem("userName", loginData.user.name);
              }
              router.push(redirect || "/");
            } else {
              setError(loginData.message || "Login failed after verification");
            }
          } else {
            setShowVerification(true); // Show code input
          }
        } catch (err) {
          setShowVerification(true); // Fallback: show code input
        }
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifLoading(true);
    setVerifError("");
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const data = await response.json();
      if (response.ok) {
        // Now log the user in automatically
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok && loginData.token) {
          localStorage.setItem("token", loginData.token);
          localStorage.setItem("userEmail", email);
          if (loginData.user && loginData.user.id) {
            localStorage.setItem("userId", loginData.user.id.toString());
          }
          if (loginData.user && loginData.user.name) {
            localStorage.setItem("userName", loginData.user.name);
          }
          router.push(redirect || "/");
        } else {
          setVerifError(loginData.message || "Login failed after verification");
        }
      } else {
        setVerifError(data.message || "Verification failed");
      }
    } catch (err) {
      setVerifError("Network error. Please try again.");
    } finally {
      setVerifLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendStatus("");
    setResendLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setResendStatus("Verification code resent! Please check your email.");
      } else {
        setResendStatus(data.message || "Failed to resend code.");
      }
    } catch (err) {
      setResendStatus("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-4 sm:p-8 rounded-2xl shadow-xl bg-white/70 backdrop-blur-xl border-2 border-[#FFD700]/30 transition-all duration-300 hover:shadow-2xl hover:border-[#FFD700]/60 focus-within:shadow-gold-400/40 focus-within:border-[#FFD700]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FF9800] bg-clip-text text-transparent">
            MIALTER
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showVerification ? (
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <User className="h-5 w-5" />
                  </span>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="pl-10 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Mail className="h-5 w-5" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="pl-10 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Lock className="h-5 w-5" />
                  </span>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="pl-10 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm text-base"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Lock className="h-5 w-5" />
                  </span>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="pl-10 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm text-base"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded animate-fade-in transition-all duration-300">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full py-3 text-base rounded-lg mt-2" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-semibold"
                  onClick={() => router.push("/login")}
                >
                  Sign in
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center text-gray-700 mb-2">
                We sent a 6-digit code to <span className="font-semibold">{email}</span>.<br />
                Please enter it below to verify your account.
              </div>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                minLength={6}
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit code"
                required
                className="text-center tracking-widest text-2xl font-mono"
              />
              {verifError && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded animate-fade-in transition-all duration-300">{verifError}</div>}
              <Button type="submit" className="w-full" disabled={verifLoading}>
                {verifLoading ? "Verifying..." : "Verify Email"}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={handleResendCode} disabled={resendLoading}>
                {resendLoading ? "Resending..." : "Resend Code"}
              </Button>
              {resendStatus && <div className="text-center text-sm mt-2 text-blue-600 animate-fade-in transition-all duration-300">{resendStatus}</div>}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 