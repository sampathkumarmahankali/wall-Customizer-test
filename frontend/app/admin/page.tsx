"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BarChart3, 
  TrendingUp, 
  Crown,
  Download,
  Calendar,
  Activity,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  todaySessions: number;
  premiumUsers: number;
}

interface AnalyticsData {
  registrationTrend: Array<{ date: string; count: number }>;
  sessionTrend: Array<{ date: string; count: number }>;
  hourlyActivity: Array<{ hour: number; count: number }>;
  subscriptionStats: Array<{ subscription_status: string; count: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch dashboard stats
        const statsResponse = await fetch(`${API_URL}/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Fetch analytics data
        const analyticsResponse = await fetch(`${API_URL}/admin/analytics?period=30`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (statsResponse.ok && analyticsResponse.ok) {
          const statsData = await statsResponse.json();
          const analyticsData = await analyticsResponse.json();
          
          setStats(statsData);
          setAnalytics(analyticsData);
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleExportUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/export/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users-export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'users':
        router.push('/admin/users');
        break;
      case 'analytics':
        router.push('/admin/reports');
        break;
      case 'export':
        handleExportUsers();
        break;
      case 'payments':
        router.push('/admin/payments');
        break;
      case 'moderation':
        router.push('/admin/moderation');
        break;
      case 'settings':
        router.push('/admin/settings');
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] flex flex-col relative"> {/* Match home page background */}
      {/* Removed decorative background shapes */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <div className="max-w-7xl w-full space-y-10 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-extrabold text-gray-900 drop-shadow mb-2">Admin Dashboard</h1>
              <p className="text-lg text-gray-600">Overview of your MIALTER platform</p>
            </div>
            <Button onClick={handleExportUsers} className="flex items-center gap-2 bg-[#FF9800] hover:bg-[#fb8c00] text-white text-lg font-bold rounded-md shadow px-6 py-3">
              <Download className="h-5 w-5" />
              Export Users
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30 cursor-pointer hover:shadow-amber-200 transition-shadow" onClick={() => handleQuickAction('users')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">Total Users</CardTitle>
                <Users className="h-6 w-6 text-[#FF9800]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-indigo-700">{stats?.totalUsers || 0}</div>
                <p className="text-sm text-gray-500 mt-1">All registered users</p>
                <div className="flex items-center mt-2 text-xs text-blue-600">
                  <span>View details</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30 cursor-pointer hover:shadow-amber-200 transition-shadow" onClick={() => handleQuickAction('analytics')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">Active Users</CardTitle>
                <Activity className="h-6 w-6 text-[#8e44ad]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-indigo-700">{stats?.activeUsers || 0}</div>
                <p className="text-sm text-gray-500 mt-1">Active in last 30 days</p>
                <div className="flex items-center mt-2 text-xs text-blue-600">
                  <span>View analytics</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30 cursor-pointer hover:shadow-amber-200 transition-shadow" onClick={() => handleQuickAction('analytics')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">Total Sessions</CardTitle>
                <BarChart3 className="h-6 w-6 text-[#C71585]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-indigo-700">{stats?.totalSessions || 0}</div>
                <p className="text-sm text-gray-500 mt-1">All design sessions</p>
                <div className="flex items-center mt-2 text-xs text-blue-600">
                  <span>View reports</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30 cursor-pointer hover:shadow-amber-200 transition-shadow" onClick={() => handleQuickAction('payments')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">Premium Users</CardTitle>
                <Crown className="h-6 w-6 text-[#FFD700]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-indigo-700">{stats?.premiumUsers || 0}</div>
                <p className="text-sm text-gray-500 mt-1">Premium subscribers</p>
                <div className="flex items-center mt-2 text-xs text-blue-600">
                  <span>View payments</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            {/* Registration Trend */}
            <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30 p-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-2xl font-extrabold text-indigo-700 drop-shadow">
                  <TrendingUp className="h-7 w-7 text-[#FF9800]" />
                  User Registration Trend
                </CardTitle>
                {analytics?.registrationTrend && analytics.registrationTrend.length > 0 && (
                  <div className="mt-2 text-lg font-semibold text-green-700">
                    {analytics.registrationTrend.reduce((sum, item) => sum + item.count, 0)} registrations in last {analytics.registrationTrend.length} days
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {analytics?.registrationTrend && analytics.registrationTrend.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.registrationTrend.slice(-7).map((item, index) => {
                      const max = Math.max(...analytics.registrationTrend.map(r => r.count));
                      const percent = max > 0 ? (item.count / max) * 100 : 0;
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <span className="text-base text-gray-600 w-28 flex-shrink-0">{item.date}</span>
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden ml-2">
                              <div
                                className="absolute left-0 top-0 h-4 rounded-full bg-gradient-to-r from-indigo-400 via-indigo-600 to-[#FF9800] shadow"
                                style={{ width: `${percent}%`, minWidth: 8 }}
                              ></div>
                            </div>
                            <span className="text-base font-bold text-indigo-700 ml-2 flex-shrink-0">{item.count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No registration data available</p>
                )}
              </CardContent>
            </Card>
            {/* Add more chart cards here as needed, matching the style */}
          </div>
        </div>
      </div>
    </div>
  );
} 