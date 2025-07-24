'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllSharedSessions, updateSharedSession, deleteSharedSession, getSharedSession } from '@/lib/shared';
import { ClipboardCopy } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function SharedSettingsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [manageSession, setManageSession] = useState<any>(null);
  const [editors, setEditors] = useState<string[]>([]);
  const [viewers, setViewers] = useState<string[]>([]);
  const [shareType, setShareType] = useState<'public' | 'private' | 'view'>('view');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setLoading(true);
    getAllSharedSessions()
      .then((data) => {
        setSessions(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load shared sessions');
        setSessions([]);
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Open manage modal and load session details
  const handleManage = async (sessionId: number) => {
    setManageOpen(true);
    setFeedback(null);
    setSearchEmail('');
    setSearchResults([]);
    setSearching(false);
    setSaving(false);
    setDeleting(false);
    try {
      const session = await getSharedSession(sessionId);
      setManageSession(session);
      setEditors(Array.isArray(session.editors) ? session.editors : JSON.parse(session.editors || '[]'));
      setViewers(Array.isArray(session.viewers) ? session.viewers : JSON.parse(session.viewers || '[]'));
      setShareType(session.type || 'view');
    } catch (err: any) {
      setFeedback(err.message || 'Failed to load session');
    }
  };

  // User search by email
  const handleSearch = async () => {
    setSearching(true);
    setSearchResults([]);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/users?email=${encodeURIComponent(searchEmail)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const users = await res.json();
      setSearchResults(users);
    } catch (err) {
      setSearchResults([]);
    }
    setSearching(false);
  };

  // Add editor/viewer
  const addEditor = (email: string) => {
    if (!editors.includes(email)) setEditors([...editors, email]);
  };
  const addViewer = (email: string) => {
    if (!viewers.includes(email)) setViewers([...viewers, email]);
  };
  // Remove editor/viewer
  const removeEditor = (email: string) => setEditors(editors.filter(e => e !== email));
  const removeViewer = (email: string) => setViewers(viewers.filter(e => e !== email));

  // Save changes
  const handleSave = async () => {
    if (!manageSession) return;
    setSaving(true);
    setFeedback(null);
    try {
      await updateSharedSession(manageSession.id, {
        type: shareType,
        editors,
        viewers,
        last_edited_by: localStorage.getItem('userId'),
      });
      setFeedback('Changes saved!');
      // Refresh table
      const data = await getAllSharedSessions();
      setSessions(data);
      setManageOpen(false);
    } catch (err: any) {
      setFeedback(err.message || 'Failed to save changes');
    }
    setSaving(false);
  };

  // Delete share
  const handleDelete = async () => {
    if (!manageSession) return;
    setDeleting(true);
    setFeedback(null);
    try {
      await deleteSharedSession(manageSession.id);
      setFeedback('Share deleted!');
      // Refresh table
      const data = await getAllSharedSessions();
      setSessions(data);
      setManageOpen(false);
    } catch (err: any) {
      setFeedback(err.message || 'Failed to delete share');
    }
    setDeleting(false);
  };

  const handleCopyLink = (session: any) => {
    const isEditable = session.type === 'public' || session.type === 'private';
    const link = isEditable
      ? `${window.location.origin}/editor?sessionId=${session.session_id}`
      : `${window.location.origin}/altar/${session.session_id}?shared=1`;
    navigator.clipboard.writeText(link);
    setCopiedLink(session.id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Shared Sessions Management</h1>
      <div className="overflow-x-auto rounded-xl shadow border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#FFF8E1]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Session</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Edited At</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created At</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Editors</th>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-red-400">{error}</td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No shared sessions yet.</td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{session.session_name || ''}</td>
                  <td className="px-4 py-3">
                    <Badge variant={session.type === 'public' ? 'default' : 'secondary'} className={session.type === 'public' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                      {session.type ? session.type.charAt(0).toUpperCase() + session.type.slice(1) : ''}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{session.last_edited_at ? new Date(session.last_edited_at).toLocaleString() : ''}</td>
                  <td className="px-4 py-3 text-gray-700">{session.created_at ? new Date(session.created_at).toLocaleString() : ''}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {Array.isArray(session.editors)
                      ? session.editors.map((editor: string) => (
                          <span key={editor} className="inline-block bg-[#FFD700]/20 text-[#C71585] rounded px-2 py-1 text-xs mr-1 mb-1">
                            {editor}
                          </span>
                        ))
                      : session.editors
                      ? JSON.parse(session.editors).map((editor: string) => (
                          <span key={editor} className="inline-block bg-[#FFD700]/20 text-[#C71585] rounded px-2 py-1 text-xs mr-1 mb-1">
                            {editor}
                          </span>
                        ))
                      : ''}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => handleManage(session.id)}>Manage</Button>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyLink(session)}
                      className="flex items-center gap-1"
                    >
                      <ClipboardCopy className="h-4 w-4" />
                      {copiedLink === session.id ? 'Copied!' : 'Copy Link'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Share</DialogTitle>
          </DialogHeader>
          {manageSession ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Share Type</label>
                <Select value={shareType} onValueChange={v => setShareType(v as any)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="view">View Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Editors</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editors.map(email => (
                    <span key={email} className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs flex items-center">
                      {email}
                      <button className="ml-1 text-red-500 hover:text-red-700" onClick={() => removeEditor(email)} title="Remove">&times;</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search user email..."
                    value={searchEmail}
                    onChange={e => setSearchEmail(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                  />
                  <Button size="sm" onClick={handleSearch} disabled={searching}>Search</Button>
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Click to add as editor</div>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.map((user: any) => (
                        <Button key={user.email} size="sm" variant="secondary" onClick={() => addEditor(user.email)}>
                          {user.email}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Viewers</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {viewers.map(email => (
                    <span key={email} className="bg-green-100 text-green-800 rounded px-2 py-1 text-xs flex items-center">
                      {email}
                      <button className="ml-1 text-red-500 hover:text-red-700" onClick={() => removeViewer(email)} title="Remove">&times;</button>
                    </span>
                  ))}
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Click to add as viewer</div>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.map((user: any) => (
                        <Button key={user.email} size="sm" variant="secondary" onClick={() => addViewer(user.email)}>
                          {user.email}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {feedback && <div className="text-center text-sm text-blue-700 mt-2">{feedback}</div>}
              <DialogFooter>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>Delete Share</Button>
                <Button onClick={handleSave} disabled={saving}>Save Changes</Button>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </div>
          ) : (
            <div className="text-center text-gray-500">Loading session details...</div>
          )}
        </DialogContent>
      </Dialog>
      <div className="mt-8 text-sm text-gray-500">
        <p><strong>Public sessions</strong> are visible to anyone with the link. <strong>Private sessions</strong> are only accessible to invited users.</p>
        <p className="mt-2">You can manage who can view or edit each session, and see who last edited them for transparency and security.</p>
      </div>
    </div>
  );
} 