"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Users,
  Download,
  Calendar,
  BarChart3,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PaymentData {
  totalRevenue: number;
  monthlyRevenue: number;
  paymentMethods: Array<{ method: string; count: number; amount: number }>;
  subscriptionRevenue: number;
}

// Add Plan interface for type safety
interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  session_limit: number;
  edit_image_enabled?: boolean;
  tools_enabled?: boolean;
  export_enabled?: boolean;
  max_decors?: number;
}

export default function PaymentsPage() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Plan management state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [newFeature, setNewFeature] = useState("");
  const [featureEditIdx, setFeatureEditIdx] = useState<number | null>(null);
  const [featureEditValue, setFeatureEditValue] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch plans from backend (must be at top level)
  useEffect(() => {
    setLoadingPlans(true);
    fetch(`${API_URL}/plans`)
      .then(res => res.json())
      .then(data => {
        const rawPlans = Array.isArray(data.plans) ? data.plans : [];
        const normalized = rawPlans.map((p: any) => ({
          id: String(p.id ?? ''),
          name: p.name ?? '',
          price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
          features: Array.isArray(p.features)
            ? p.features
            : (typeof p.features === 'string' ? JSON.parse(p.features) : []),
          session_limit: typeof p.session_limit === 'number' ? p.session_limit : Number(p.session_limit) || 0,
          edit_image_enabled: p.edit_image_enabled === undefined ? true : Boolean(p.edit_image_enabled),
          tools_enabled: p.tools_enabled === undefined ? true : Boolean(p.tools_enabled),
          export_enabled: p.export_enabled === undefined ? true : Boolean(p.export_enabled),
          max_decors: typeof p.max_decors === 'number' ? p.max_decors : Number(p.max_decors) || 10,
        }));
        setPlans(normalized);
      })
      .catch(() => setPlans([]))
      .finally(() => setLoadingPlans(false));
  }, []);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/admin/payments?period=30`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPaymentData(data);
        }
      } catch (error) {
        console.error('Payment data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Add a helper for INR formatting
  const formatINR = (amount: number) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'export':
        handleExportRevenueReport();
        break;
      case 'subscribers':
        router.push('/admin/users');
        break;
      case 'history':
        handleViewPaymentHistory();
        break;
      case 'analytics':
        router.push('/admin/reports');
        break;
    }
  };

  const handleExportRevenueReport = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // This would call the actual export endpoint
      console.log('Exporting revenue report...');
      
      // Simulate export
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = '#';
        link.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('Revenue report exported successfully!');
      }, 1000);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const handleViewPaymentHistory = () => {
    alert('Payment history feature would show detailed transaction logs. This would typically open a modal or navigate to a dedicated page.');
  };

  // In handleEditPlan and handleAddPlan, always provide all required fields
  const handleEditPlan = (plan: Plan) => {
    setEditingPlan({
      id: plan.id,
      name: plan.name ?? '',
      price: plan.price ?? 0,
      features: Array.isArray(plan.features) ? plan.features : [],
      session_limit: plan.session_limit ?? 0,
      edit_image_enabled: plan.edit_image_enabled ?? true,
      tools_enabled: plan.tools_enabled ?? true,
      export_enabled: plan.export_enabled ?? true,
      max_decors: plan.max_decors ?? 10,
    });
    setShowPlanModal(true);
    setNewFeature("");
    setFeatureEditIdx(null);
    setFeatureEditValue("");
  };

  const handleAddPlan = () => {
    setEditingPlan({ id: '', name: '', price: 0, features: [], session_limit: 0, edit_image_enabled: true, tools_enabled: true, export_enabled: true, max_decors: 10 });
    setShowPlanModal(true);
    setNewFeature("");
    setFeatureEditIdx(null);
    setFeatureEditValue("");
  };

  // Delete plan
  const handleDeletePlan = async (planId: string) => {
    try {
      const res = await fetch(`${API_URL}/plans/${planId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete plan');
      setPlans(plans.filter(p => p.id !== planId));
      toast.success("Plan deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete plan");
    }
  };

  // Add or update plan
  const handleSavePlan = async () => {
    if (!editingPlan || typeof editingPlan !== 'object') return;
    if (!editingPlan.name) {
      toast.error("Plan name is required");
      return;
    }
    try {
      if (editingPlan.id && editingPlan.id !== '') {
        // Update existing plan
        const res = await fetch(`${API_URL}/plans/${editingPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingPlan.name,
            price: editingPlan.price,
            features: editingPlan.features,
            session_limit: editingPlan.session_limit,
            edit_image_enabled: editingPlan.edit_image_enabled,
            tools_enabled: editingPlan.tools_enabled,
            export_enabled: editingPlan.export_enabled,
            max_decors: editingPlan.max_decors,
          }),
        });
        const text = await res.text();
        let updated: any;
        try { updated = JSON.parse(text); } catch { updated = text; }
        if (!res.ok) {
          toast.error(`Failed to update plan: ${res.status} ${res.statusText}`);
          console.error('Update plan error:', updated);
          return;
        }
        setPlans(plans.map(p => (p.id === editingPlan.id ? { ...updated, id: String(updated.id), features: updated.features } : p)));
        toast.success("Plan updated");
      } else {
        // Add new plan
        const res = await fetch(`${API_URL}/plans`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingPlan.name,
            price: editingPlan.price,
            features: editingPlan.features,
            session_limit: editingPlan.session_limit,
            edit_image_enabled: editingPlan.edit_image_enabled,
            tools_enabled: editingPlan.tools_enabled,
            export_enabled: editingPlan.export_enabled,
            max_decors: editingPlan.max_decors,
          }),
        });
        const text = await res.text();
        let created: any;
        try { created = JSON.parse(text); } catch { created = text; }
        if (!res.ok) {
          toast.error(`Failed to add plan: ${res.status} ${res.statusText}`);
          console.error('Add plan error:', created);
          return;
        }
        setPlans([...plans, { ...created, id: String(created.id), features: created.features }]);
        toast.success("Plan added");
      }
      setShowPlanModal(false);
      setEditingPlan(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save plan");
      console.error('Save plan error:', err);
    }
  };

  const handleAddFeature = () => {
    if (!editingPlan || typeof editingPlan !== 'object' || !newFeature.trim()) return;
    setEditingPlan({ ...editingPlan, features: [...(editingPlan.features || []), newFeature.trim()] });
    setNewFeature("");
  };

  const handleEditFeature = (idx: number) => {
    if (!editingPlan || typeof editingPlan !== 'object') return;
    setFeatureEditIdx(idx);
    setFeatureEditValue(editingPlan.features[idx]);
  };

  const handleSaveFeatureEdit = () => {
    if (!editingPlan || typeof editingPlan !== 'object' || featureEditIdx === null) return;
    const updated = [...editingPlan.features];
    updated[featureEditIdx] = featureEditValue;
    setEditingPlan({ ...editingPlan, features: updated });
    setFeatureEditIdx(null);
    setFeatureEditValue("");
  };

  const handleDeleteFeature = (idx: number) => {
    if (!editingPlan || typeof editingPlan !== 'object') return;
    const updated = [...editingPlan.features];
    updated.splice(idx, 1);
    setEditingPlan({ ...editingPlan, features: updated });
  };

  // Convert plans object to array if needed
  const planArray: Plan[] = Array.isArray(plans)
    ? plans.map(p => ({
        id: p.id,
        name: typeof p.name === 'string' ? p.name : '',
        price: typeof p.price === 'number' ? p.price : 0,
        features: Array.isArray(p.features) ? p.features : [],
        session_limit: typeof p.session_limit === 'number' ? p.session_limit : 0,
        edit_image_enabled: p.edit_image_enabled ?? true,
        tools_enabled: p.tools_enabled ?? true,
        export_enabled: p.export_enabled ?? true,
        max_decors: p.max_decors ?? 10,
      }))
    : Object.entries(plans).map(([key, value]) => {
        const v = value as any;
        return {
          id: key,
          name: typeof v.name === 'string' ? v.name : '',
          price: typeof v.price === 'number' ? v.price : 0,
          features: Array.isArray(v.features) ? v.features : [],
          session_limit: typeof v.session_limit === 'number' ? v.session_limit : 0,
          edit_image_enabled: v.edit_image_enabled ?? true,
          tools_enabled: v.tools_enabled ?? true,
          export_enabled: v.export_enabled ?? true,
          max_decors: v.max_decors ?? 10,
        };
      });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] flex flex-col">
      <div className="max-w-7xl w-full py-12 px-4 mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow mb-2">Payments & Plans</h1>
          {/* Add any top-level actions here if needed */}
        </div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Analytics</h1>
            <p className="text-gray-600 mt-2">Monitor revenue and subscription data</p>
          </div>
          <Button 
            onClick={() => handleQuickAction('export')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleQuickAction('analytics')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(paymentData?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                All time revenue
              </p>
              <div className="flex items-center mt-2 text-xs text-blue-600">
                <span>View analytics</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleQuickAction('analytics')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(paymentData?.monthlyRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
              <div className="flex items-center mt-2 text-xs text-blue-600">
                <span>View trends</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleQuickAction('analytics')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(paymentData?.subscriptionRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Recurring revenue
              </p>
              <div className="flex items-center mt-2 text-xs text-blue-600">
                <span>View details</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleQuickAction('subscribers')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paymentData?.paymentMethods.reduce((acc, method) => acc + method.count, 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Paying customers
              </p>
              <div className="flex items-center mt-2 text-xs text-blue-600">
                <span>View subscribers</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentData?.paymentMethods && paymentData.paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentData.paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{method.method}</div>
                        <div className="text-sm text-gray-500">{method.count} transactions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(method.amount)}</div>
                      <div className="text-sm text-gray-500">
                        {((method.amount / (paymentData.totalRevenue || 1)) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment data</h3>
                <p className="text-gray-500">Payment analytics will appear here when transactions occur.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart Placeholder */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Chart</h3>
                <p className="text-gray-500">Chart will display revenue trends over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plans Management */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Subscription Plans</CardTitle>
            <Button onClick={handleAddPlan}>Add Plan</Button>
          </CardHeader>
          <CardContent>
            {loadingPlans ? (
              <div>Loading plans...</div>
            ) : plans.length === 0 ? (
              <div>No plans found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto pr-2">
                {plans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-6 text-center relative group bg-white">
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" onClick={() => handleEditPlan(plan)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeletePlan(plan.id)}>Delete</Button>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{formatINR(Number(plan.price))}</div>
                    <div className="text-gray-600 mb-2">Session Limit: {plan.session_limit}</div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                      {(plan.features || []).map((b: string, i: number) => (
                        <li key={i}>• {b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Plan Modal */}
        <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
          <DialogContent className="max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan?.id ? "Edit Plan" : "Add Plan"}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Plan Name"
                value={editingPlan?.name || ""}
                onChange={e => setEditingPlan({ ...editingPlan!, name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Price"
                value={editingPlan?.price || 0}
                onChange={e => setEditingPlan({ ...editingPlan!, price: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Session Limit"
                value={editingPlan?.session_limit || 0}
                onChange={e => setEditingPlan({ ...editingPlan!, session_limit: Number(e.target.value) })}
              />
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="editImageToggle">Edit Image</label>
                  <input
                    id="editImageToggle"
                    type="checkbox"
                    checked={!!editingPlan?.edit_image_enabled}
                    onChange={e => setEditingPlan({ ...editingPlan!, edit_image_enabled: e.target.checked })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="toolsToggle">Tools</label>
                  <input
                    id="toolsToggle"
                    type="checkbox"
                    checked={!!editingPlan?.tools_enabled}
                    onChange={e => setEditingPlan({ ...editingPlan!, tools_enabled: e.target.checked })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="exportToggle">Export</label>
                  <input
                    id="exportToggle"
                    type="checkbox"
                    checked={!!editingPlan?.export_enabled}
                    onChange={e => setEditingPlan({ ...editingPlan!, export_enabled: e.target.checked })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="maxDecors">Number of Decors</label>
                <Input
                  id="maxDecors"
                  type="number"
                  min={1}
                  value={editingPlan?.max_decors || 10}
                  onChange={e => setEditingPlan({ ...editingPlan!, max_decors: Number(e.target.value) })}
                  className="w-32"
                />
              </div>
              <div>
                <div className="font-semibold mb-2">Features</div>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add feature"
                    value={newFeature}
                    onChange={e => setNewFeature(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddFeature(); }}
                  />
                  <Button onClick={handleAddFeature}>Add</Button>
                </div>
                <ul className="space-y-2">
                  {(editingPlan?.features || []).map((b: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      {featureEditIdx === i ? (
                        <>
                          <Input
                            value={featureEditValue}
                            onChange={e => setFeatureEditValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSaveFeatureEdit(); }}
                          />
                          <Button size="sm" onClick={handleSaveFeatureEdit}>Save</Button>
                          <Button size="sm" variant="destructive" onClick={() => setFeatureEditIdx(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <span>{b}</span>
                          <Button size="sm" variant="outline" onClick={() => handleEditFeature(i)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteFeature(i)}>Delete</Button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowPlanModal(false)}>Cancel</Button>
                <Button onClick={handleSavePlan}>{editingPlan?.id ? "Update" : "Add"} Plan</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Actions */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center hover:bg-green-50 hover:border-green-300 transition-colors"
                onClick={() => handleQuickAction('export')}
              >
                <Download className="h-6 w-6 mb-2" />
                Export Revenue Report
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
                onClick={() => handleQuickAction('subscribers')}
              >
                <Users className="h-6 w-6 mb-2" />
                View Subscribers
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center hover:bg-purple-50 hover:border-purple-300 transition-colors"
                onClick={() => handleQuickAction('history')}
              >
                <Calendar className="h-6 w-6 mb-2" />
                Payment History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 