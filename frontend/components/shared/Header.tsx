"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Home, FileText, Edit, BarChart3, PlusCircle, Shield, Settings, HelpCircle, Info, Mail, UserCog, Share2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { authenticatedFetch } from "@/lib/auth";

interface HeaderProps {
  showLogout?: boolean;
  showProfile?: boolean;
  className?: string;
  announcement?: string;
}

export default function Header({ showLogout = true, showProfile = true, className = "", announcement }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState<boolean | 'settings'>(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Helper to check login state and admin role
  const checkLogin = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      setIsAdmin(localStorage.getItem("userRole") === "admin");
    }
  };

  useEffect(() => {
    checkLogin();
    // Listen for storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        checkLogin();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Update login state on route change
  useEffect(() => {
    checkLogin();
  }, [pathname]);

  useEffect(() => {
    if (menuOpen === 'settings') {
      const handleClickOutside = (event: MouseEvent) => {
        if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
          setMenuOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Create", href: "/create", icon: PlusCircle },
    { name: "Editor", href: "/editor", icon: Edit },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings/shared", icon: Settings },
  ];

  return (
    <>
      {/* Announcement Bar */}
      {announcement && (
        <div className="w-full bg-green-100 text-green-900 text-center py-2 text-sm font-medium border-b border-green-200">
          {announcement}
        </div>
      )}
      <header className={`w-full bg-gradient-to-r from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] shadow-md px-4 md:px-10 py-3 flex items-center justify-between z-50 border-b border-[#FFD700]/30 ${className}`}> {/* Enhanced background and border */}
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push("/")}> 
          {/* Use uploaded logo image without background */}
          <img src="/mialtar-logo.png" alt="MIALTAR Logo" className="h-10 w-auto" style={{ display: 'block' }} />
        </div>
        {/* Navigation Links */}
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map(link => (
            <button
              key={link.name}
              onClick={() => router.push(link.href)}
              className={`flex items-center gap-1 font-medium transition-colors
                ${pathname === link.href ? 'text-indigo-600 font-bold underline underline-offset-4' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              <link.icon className="h-5 w-5" />
              {link.name}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => router.push("/admin")}
              className={`flex items-center gap-1 font-medium transition-colors
                ${pathname === "/admin" ? 'text-indigo-600 font-bold underline underline-offset-4' : 'text-gray-700 hover:text-indigo-600'}`}
            >
              <Shield className="h-5 w-5" />
              Admin
            </button>
          )}
        </nav>
        {/* CTA & User Menu */}
        <div className="flex items-center gap-2">
          {/* Show Profile button only on desktop */}
          {isLoggedIn && showLogout && (
            <Button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-full px-5 py-2 font-semibold bg-[#FF9800] text-white hover:bg-[#fb8c00] transition-all border-none"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          )}
          {!isLoggedIn && (
            <Button
              onClick={handleLogin}
              className="flex items-center gap-1 rounded-full px-5 py-2 font-semibold bg-[#FF9800] text-white hover:bg-[#fb8c00] transition-all border-none"
            >
              Login
            </Button>
          )}
          {/* Mobile menu toggle */}
          <button className="md:hidden ml-2 p-2 rounded hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </div>
        {/* Mobile Menu */}
        {menuOpen === true && (
          <div className="absolute top-16 left-0 w-full bg-white shadow-lg flex flex-col items-center py-4 gap-4 md:hidden z-50 border-t">
            {navLinks.map(link => (
              <button
                key={link.name}
                onClick={() => { router.push(link.href); setMenuOpen(false); }}
                className={`flex items-center gap-2 text-lg font-medium w-full justify-center transition-colors
                  ${pathname === link.href ? 'text-indigo-600 font-bold underline underline-offset-4 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600'}`}
              >
                <link.icon className="h-5 w-5" />
                {link.name}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => { router.push("/admin"); setMenuOpen(false); }}
                className={`flex items-center gap-2 text-lg font-medium w-full justify-center transition-colors
                  ${pathname === "/admin" ? 'text-indigo-600 font-bold underline underline-offset-4 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600'}`}
              >
                <Shield className="h-5 w-5" />
                Admin
              </button>
            )}
            {/* Profile button removed from mobile menu */}
            {isLoggedIn && showLogout && (
              <Button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="flex items-center gap-1 w-full justify-center rounded-full px-5 py-2 font-semibold bg-[#FF9800] text-white hover:bg-[#fb8c00] transition-all border-none"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            )}
            {!isLoggedIn && (
              <Button
                onClick={() => { handleLogin(); setMenuOpen(false); }}
                className="flex items-center gap-1 w-full justify-center rounded-full px-5 py-2 font-semibold bg-[#FF9800] text-white hover:bg-[#fb8c00] transition-all border-none"
              >
                Login
              </Button>
            )}
          </div>
        )}
      </header>
    </>
  );
} 