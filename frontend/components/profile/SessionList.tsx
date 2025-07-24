import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Edit3, 
  Calendar, 
  FileText, 
  Plus,
  Loader2,
  AlertCircle,
  FolderOpen,
  Trash2
} from 'lucide-react';

// Mock session data type
interface Session {
  id: string;
  name: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchUserIdByEmail = async (email: string): Promise<string | null> => {
  const res = await fetch(`${API_URL}/auth/userid-by-email/${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.userId;
};

// Mock fetch function (replace with real API later)
const fetchUserSessions = async (userId: string): Promise<Session[]> => {
  if (!userId) return [];
  const res = await fetch(`${API_URL}/sessions/${userId}`);
  if (!res.ok) return [];
  const data = await res.json();
  // Map backend fields to frontend Session type
  return data.map((s: any) => ({
    id: s.id.toString(),
    name: s.name,
    updatedAt: s.updated_at,
  }));
};

// Delete session function
const deleteSession = async (sessionId: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/session/${sessionId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    return false;
  }
};

const SessionList: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [page, setPage] = useState(0); // pagination state
  const sessionsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      setSessions([]);
      setLoading(false);
      setError("No user email found.");
      return;
    }
    fetchUserIdByEmail(email).then((userId) => {
      if (!userId) {
        setSessions([]);
        setLoading(false);
        setError("User not found for email: " + email);
        return;
      }
      fetchUserSessions(userId).then((data) => {
        setSessions(data);
        setLoading(false);
      });
    });
  }, []);

  const handleSessionClick = (sessionId: string) => {
    router.push(`/editor?sessionId=${sessionId}`);
  };

  const handleCreateNew = () => {
    router.push('/create');
  };

  const handleDeleteSession = async (sessionId: string, sessionName: string) => {
    // Confirm deletion
    const confirmed = window.confirm(`Are you sure you want to delete "${sessionName}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingSessionId(sessionId);
    
    const success = await deleteSession(sessionId);
    
    if (success) {
      // Remove the session from the local state
      setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
    } else {
      alert('Failed to delete session. Please try again.');
    }
    
    setDeletingSessionId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Pagination logic
  const paginatedSessions = sessions.slice(page * sessionsPerPage, (page + 1) * sessionsPerPage);
  const hasNext = (page + 1) * sessionsPerPage < sessions.length;
  const hasPrev = page > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Error loading sessions</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create New Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Your Sessions</h2>
          <p className="text-gray-600 text-sm">Continue where you left off</p>
        </div>
        <Button 
          onClick={handleCreateNew}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No sessions yet</h3>
            <p className="text-gray-500 text-center mb-6">
              Start creating your first wall design session
            </p>
            <Button 
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Session
            </Button>
          </CardContent>
        </Card>
      ) :
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedSessions.map((session) => (
              <Card 
                key={session.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50/30"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => handleSessionClick(session.id)}
                    >
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                          {session.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDate(session.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id, session.name);
                        }}
                        disabled={deletingSessionId === session.id}
                      >
                        {deletingSessionId === session.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Last edited</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSessionClick(session.id);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            {hasPrev && (
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)}>
                Previous
              </Button>
            )}
            {hasNext && (
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>
                Next
              </Button>
            )}
          </div>
        </>
      }

      {/* Quick Stats */}
      {sessions.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Sessions: <span className="font-semibold text-gray-800">{sessions.length}</span></span>
            <span className="text-gray-600">Recent Activity: <span className="font-semibold text-gray-800">{sessions.length > 0 ? formatDate(sessions[0].updatedAt) : 'None'}</span></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionList; 