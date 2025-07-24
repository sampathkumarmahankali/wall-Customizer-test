"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Footer from "@/components/shared/Footer"
import { setToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Login failed.")
        setLoading(false)
        return
      }
      if (data.token) {
        setToken(data.token);
      }
      localStorage.setItem("userEmail", data.user.email)
      localStorage.setItem("userRole", data.user.role)
      const redirect = searchParams.get('redirect');
      if (redirect) {
        router.replace(redirect);
      } else {
        router.replace("/");
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] flex flex-col overflow-x-hidden"> {/* Light gold/cream background */}
      {/* Decorative background shapes */}
      <div className="absolute top-20 -left-8 w-64 h-64 bg-[#FFD700]/30 rounded-3xl rotate-6 z-0 pointer-events-none" /> {/* Gold */}
      <div className="absolute -bottom-8 right-8 w-32 h-32 bg-[#A0522D]/20 rounded-full z-0 pointer-events-none" /> {/* Brown */}
      <div className="absolute top-32 right-24 w-24 h-24 bg-[#C71585]/20 rounded-full z-0 pointer-events-none" /> {/* Rose */}
      <div className="absolute bottom-0 left-1/2 w-20 h-20 bg-[#8e44ad]/20 rounded-full z-0 pointer-events-none" /> {/* Purple */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-green-600 bg-clip-text text-transparent tracking-tight text-center">MIALTER Login</CardTitle>
            <CardDescription className="text-center">Sign in to access your virtual altar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
              <div className="text-xs text-gray-500 text-center mt-2">
                New user? {(() => {
                  const redirect = searchParams.get('redirect');
                  const registerHref = redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register';
                  return <a href={registerHref} className="text-blue-600 underline">Register here</a>;
                })()}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
} 