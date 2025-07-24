"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlanRequest {
  id: number;
  user_id: number;
  name: string;
  email: string;
  requested_plan: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function PlanRequestsPage() {
  const [requests, setRequests] = useState<PlanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/plan-change-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        setError("Failed to fetch requests");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setActionLoading(id);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/plan-change-requests/${id}/${action}`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchRequests();
      } else {
        setError(`Failed to ${action} request`);
      }
    } catch {
      setError("Network error");
    }
    setActionLoading(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] flex flex-col">
      <div className="max-w-7xl w-full py-12 px-4 mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow mb-2">Plan Change Requests</h1>
        </div>
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader>
            <CardTitle>Pending & Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No plan change requests found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#FFF8E1]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Requested Plan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Requested At</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td className="px-4 py-3 font-medium text-gray-900">{req.name}</td>
                        <td className="px-4 py-3 text-gray-700">{req.email}</td>
                        <td className="px-4 py-3 text-gray-700">{req.requested_plan}</td>
                        <td className="px-4 py-3">
                          {req.status === 'pending' ? (
                            <Badge variant="secondary">Pending</Badge>
                          ) : req.status === 'approved' ? (
                            <Badge variant="default" className="bg-green-100 text-green-700">Approved</Badge>
                          ) : (
                            <Badge variant="destructive">Rejected</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{new Date(req.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          {req.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="default" disabled={actionLoading === req.id} onClick={() => handleAction(req.id, 'approve')}>Approve</Button>
                              <Button size="sm" variant="destructive" disabled={actionLoading === req.id} onClick={() => handleAction(req.id, 'reject')}>Reject</Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 