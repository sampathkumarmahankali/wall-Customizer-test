"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Trash2,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface FlaggedContent {
  id: number;
  type: string;
  reason: string;
  status: string;
  reportedBy: string;
  reportedAt: string;
  content: string;
  userEmail?: string;
  sessionId?: string;
}

export default function ModerationPage() {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([
    {
      id: 1,
      type: 'inappropriate_content',
      reason: 'Contains inappropriate language',
      status: 'pending',
      reportedBy: 'user@example.com',
      reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      content: 'This wall design contains inappropriate text that violates community guidelines.',
      userEmail: 'designer@example.com',
      sessionId: 'session_123'
    },
    {
      id: 2,
      type: 'copyright_violation',
      reason: 'Potential copyright infringement',
      status: 'pending',
      reportedBy: 'moderator@wallora.com',
      reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      content: 'This design appears to use copyrighted material without permission.',
      userEmail: 'artist@example.com',
      sessionId: 'session_456'
    },
    {
      id: 3,
      type: 'spam',
      reason: 'Spam or promotional content',
      status: 'approved',
      reportedBy: 'user@example.com',
      reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      content: 'This was flagged as spam but was found to be legitimate content.',
      userEmail: 'creator@example.com',
      sessionId: 'session_789'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedContent, setSelectedContent] = useState<FlaggedContent | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Decor management state
  const [categories, setCategories] = useState<any[]>([]);
  const [decors, setDecors] = useState<any[]>([]);
  const [loadingDecors, setLoadingDecors] = useState(true);
  const [showDecorModal, setShowDecorModal] = useState(false);
  const [editingDecor, setEditingDecor] = useState<any | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [decorImage, setDecorImage] = useState<File | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchFlaggedContent = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/admin/flagged-content`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFlaggedContent(data.flaggedContent || flaggedContent);
        }
      } catch (error) {
        console.error('Flagged content fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlaggedContent();
  }, []);

  // Fetch categories and decors
  useEffect(() => {
    fetch(`${API_URL}/decor-categories`)
      .then(res => res.json())
      .then(data => setCategories(data.categories || []));
    fetch(`${API_URL}/decors`)
      .then(res => res.json())
      .then(data => setDecors(data.decors || []))
      .finally(() => setLoadingDecors(false));
  }, []);

  // Set default selected category on load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const handleModerationAction = async (contentId: number, action: string) => {
    setActionLoading(contentId);
    
    try {
      const token = localStorage.getItem("token");
      
      // This would call the actual moderation endpoint
      console.log(`${action} content:`, contentId);
      
      // Simulate API call
      setTimeout(() => {
        setFlaggedContent(prev => 
          prev.map(item => 
            item.id === contentId 
              ? { ...item, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : item.status }
              : item
          )
        );
        
        if (action === 'delete') {
          setFlaggedContent(prev => prev.filter(item => item.id !== contentId));
        }
        
        setActionLoading(null);
        alert(`Content ${action}d successfully!`);
      }, 1000);
      
    } catch (error) {
      console.error('Moderation action error:', error);
      setActionLoading(null);
      alert('An error occurred while performing the action');
    }
  };

  const handleViewDetails = (content: FlaggedContent) => {
    setSelectedContent(content);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'inappropriate_content':
        return <Badge variant="destructive">Inappropriate</Badge>;
      case 'copyright_violation':
        return <Badge variant="destructive">Copyright</Badge>;
      case 'spam':
        return <Badge variant="secondary">Spam</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStats = () => {
    const pending = flaggedContent.filter(item => item.status === 'pending').length;
    const approved = flaggedContent.filter(item => item.status === 'approved').length;
    const rejected = flaggedContent.filter(item => item.status === 'rejected').length;
    return { pending, approved, rejected };
  };

  // Add category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const res = await fetch(`${API_URL}/decor-categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory.trim() })
    });
    if (res.ok) {
      const cat = await res.json();
      setCategories([...categories, cat]);
      setNewCategory("");
    }
  };

  // Add/edit decor
  const handleSaveDecor = async () => {
    if (!editingDecor?.name || !editingDecor?.category_id || !decorImage) return;
    const formData = new FormData();
    formData.append('name', editingDecor.name);
    formData.append('category_id', editingDecor.category_id);
    formData.append('is_active', editingDecor.is_active !== false ? '1' : '0');
    formData.append('image', decorImage);
    let res;
    if (editingDecor.id) {
      res = await fetch(`${API_URL}/decors/${editingDecor.id}`, {
        method: 'PUT',
        body: formData
      });
    } else {
      res = await fetch(`${API_URL}/decors`, {
        method: 'POST',
        body: formData
      });
    }
    if (res.ok) {
      const updated = await res.json();
      setDecors(editingDecor.id ? decors.map(d => d.id === editingDecor.id ? updated : d) : [...decors, updated]);
      setShowDecorModal(false);
      setEditingDecor(null);
      setDecorImage(null);
    }
  };

  // Delete decor
  const handleDeleteDecor = async (id: number) => {
    const res = await fetch(`${API_URL}/decors/${id}`, { method: "DELETE" });
    if (res.ok) setDecors(decors.filter(d => d.id !== id));
  };

  // Handle image upload (file input)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDecorImage(file);
  };

  // Group decors by category
  const decorsByCategory = categories.map(cat => ({
    ...cat,
    decors: decors.filter(d => d.category_id === cat.id)
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] flex flex-col">
      <div className="max-w-7xl w-full py-12 px-4 mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow mb-2">Content Moderation</h1>
          {/* Add any top-level actions here if needed */}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Flagged Content */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Flagged Content ({flaggedContent.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {flaggedContent.length > 0 ? (
              <div className="space-y-4">
                {flaggedContent.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getTypeBadge(item.type)}
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Reported by {item.reportedBy} on {formatDate(item.reportedAt)}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="font-medium mb-1">Reason:</h4>
                      <p className="text-sm text-gray-600">{item.reason}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium mb-1">Content:</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        {item.content}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(item)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {item.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleModerationAction(item.id, 'approve')}
                            disabled={actionLoading === item.id}
                          >
                            {actionLoading === item.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleModerationAction(item.id, 'reject')}
                            disabled={actionLoading === item.id}
                          >
                            {actionLoading === item.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleModerationAction(item.id, 'delete')}
                        disabled={actionLoading === item.id}
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No flagged content</h3>
                <p className="text-gray-500">All content has been reviewed and is clean.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decor Management Card */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Decor Management</CardTitle>
            <Button onClick={() => { setEditingDecor(null); setShowDecorModal(true); }}>Add Decor</Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2 items-center">
              <Input
                placeholder="Add new category"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-64"
              />
              <Button onClick={handleAddCategory}>Add Category</Button>
            </div>
            {/* Category selector */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {categories.map((cat, idx) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  className={selectedCategory === cat.id ? 'font-bold border-primary' : ''}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
            {loadingDecors ? (
              <div>Loading decors...</div>
            ) : (
              <div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {decorsByCategory.filter(cat => cat.id === selectedCategory).map(cat => (
                    <React.Fragment key={cat.id}>
                      {cat.decors.map((decor: any) => (
                        <div key={decor.id} className="border rounded-lg p-3 flex flex-col items-center bg-white hover:bg-blue-50 transition cursor-pointer">
                          <img src={decor.imageUrl || decor.image_base64} alt={decor.name} className="w-16 h-16 object-contain mb-2 rounded" />
                          <div className="font-semibold mb-1 text-center">{decor.name}</div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditingDecor(decor); setDecorImage(null); setShowDecorModal(true); }}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteDecor(decor.id)}>Delete</Button>
                          </div>
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Decor Modal */}
        <Dialog open={showDecorModal} onOpenChange={setShowDecorModal}>
          <DialogContent className="max-w-lg mx-auto">
            <DialogHeader>
              <DialogTitle>{editingDecor?.id ? "Edit Decor" : "Add Decor"}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Decor Name"
                value={editingDecor?.name || ""}
                onChange={e => setEditingDecor({ ...editingDecor, name: e.target.value })}
              />
              <select
                className="border rounded p-2"
                value={editingDecor?.category_id || ""}
                onChange={e => setEditingDecor({ ...editingDecor, category_id: Number(e.target.value) })}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {decorImage && <img src={URL.createObjectURL(decorImage)} alt="Preview" className="w-20 h-20 object-contain mx-auto" />}
              {!decorImage && editingDecor?.imageUrl && (
                <img src={editingDecor.imageUrl} alt="Preview" className="w-20 h-20 object-contain mx-auto" />
              )}
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="outline" onClick={() => setShowDecorModal(false)}>Cancel</Button>
                <Button onClick={handleSaveDecor}>{editingDecor?.id ? "Update" : "Add"} Decor</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Moderation Guidelines */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader>
            <CardTitle>Moderation Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Content that should be flagged:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Inappropriate or offensive content</li>
                  <li>Spam or promotional content</li>
                  <li>Copyright violations</li>
                  <li>Personal information exposure</li>
                  <li>Harmful or dangerous content</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Actions available:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li><strong>Approve:</strong> Content is appropriate and can remain</li>
                  <li><strong>Reject:</strong> Content violates guidelines and should be removed</li>
                  <li><strong>Delete:</strong> Permanently remove content from the platform</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Content Details</DialogTitle>
              <DialogDescription>
                Detailed information about the flagged content
              </DialogDescription>
            </DialogHeader>
            {selectedContent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Content Type</label>
                    <div className="mt-1">{getTypeBadge(selectedContent.type)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedContent.status)}</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Reason for Flagging</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedContent.reason}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Content</label>
                  <div className="bg-gray-50 p-3 rounded text-sm mt-1">
                    {selectedContent.content}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reported By</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedContent.reportedBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reported At</label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(selectedContent.reportedAt)}</p>
                  </div>
                </div>
                
                {selectedContent.userEmail && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Content Creator</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedContent.userEmail}</p>
                  </div>
                )}
                
                {selectedContent.sessionId && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Session ID</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedContent.sessionId}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 