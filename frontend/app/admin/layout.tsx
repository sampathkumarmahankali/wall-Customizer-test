"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  BarChart3, 
  Shield, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Content Moderation', href: '/admin/moderation', icon: Shield },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Plan Requests', href: '/admin/plan-requests', icon: Bell },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [pendingPlanCount, setPendingPlanCount] = useState(0);

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    
    if (!token || !userEmail) {
      router.push("/login");
      return;
    }

    // Verify admin status
    const verifyAdmin = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user.role !== 'admin') {
            console.log('User is not admin, redirecting...');
            router.push("/");
            return;
          }
          setAdminUser(data.user);
        } else {
          console.log('Profile fetch failed, redirecting to login...');
          router.push("/login");
        }
      } catch (error) {
        console.error('Admin verification error:', error);
        router.push("/login");
      }
    };

    verifyAdmin();

    // Fetch pending plan change request count
    const fetchPendingPlanCount = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/plan-change-requests/count`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPendingPlanCount(data.count);
        }
      } catch {}
    };
    fetchPendingPlanCount();
    const interval = setInterval(fetchPendingPlanCount, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] flex flex-col">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-r border-[#FFD700]/30 rounded-tr-3xl rounded-br-3xl shadow-2xl my-4 ml-2">
          <div className="flex h-20 items-center px-6 mb-2">
            <h1 className="text-2xl font-extrabold text-indigo-700 tracking-tight drop-shadow">Admin Panel</h1>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-4 px-4 py-3 text-lg font-semibold rounded-xl transition-all shadow-sm mb-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-100 to-[#FFD700]/30 text-indigo-900 border-l-4 border-indigo-500 shadow-md'
                      : 'text-gray-700 hover:bg-[#FFF8E1] hover:text-indigo-700'
                  }`}
                >
                  <item.icon className={`h-7 w-7 ${isActive ? 'text-indigo-600' : 'text-[#C71585]'}`} />
                  {item.name}
                  {item.name === 'Plan Requests' && pendingPlanCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {pendingPlanCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-[#FFD700]/30 p-6 mt-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {adminUser.name?.[0] || 'A'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-800">{adminUser.name}</p>
                <p className="text-xs text-gray-500">{adminUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 flex items-center gap-2 px-4 py-2 text-base font-semibold text-indigo-700 bg-[#FFD700]/20 hover:bg-[#FFD700]/40 rounded-xl w-full transition-all"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-gradient-to-r from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] shadow-md border-b border-[#FFD700]/30 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <div className="flex items-center gap-x-4">
                <span className="text-sm text-gray-500">
                  Welcome, {adminUser.name}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 