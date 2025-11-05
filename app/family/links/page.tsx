'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string | null;
  bio?: string | null;
  location?: string | null;
}

interface LinkRequest {
  id: string;
  senderId: string;
  receiverId: string;
  relationshipType: 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING';
  message?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  sender: User;
  receiver: User;
}

export default function LinkRequestsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [receivedRequests, setReceivedRequests] = useState<LinkRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<LinkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchRequests();
  }, [isAuthenticated, router]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('keora-auth-storage');
      const parsedToken = token ? JSON.parse(token) : null;
      const authToken = parsedToken?.state?.token;

      if (!authToken) {
        router.push('/login');
        return;
      }

      // Fetch received requests
      const receivedResponse = await fetch('/api/link-requests?type=received', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const receivedData = await receivedResponse.json();

      // Fetch sent requests
      const sentResponse = await fetch('/api/link-requests?type=sent', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const sentData = await sentResponse.json();

      if (receivedResponse.ok && sentResponse.ok) {
        setReceivedRequests(receivedData.requests || []);
        setSentRequests(sentData.requests || []);
      } else {
        throw new Error('Failed to fetch link requests');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load link requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject' | 'withdraw') => {
    setActionLoading(requestId);

    try {
      const token = localStorage.getItem('keora-auth-storage');
      const parsedToken = token ? JSON.parse(token) : null;
      const authToken = parsedToken?.state?.token;

      const response = await fetch(`/api/link-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || `Request ${action}d successfully`,
        });
        fetchRequests();
      } else {
        throw new Error(data.error || `Failed to ${action} request`);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${action} request`,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { color: 'bg-amber-100 text-amber-700', label: 'Pending' },
      APPROVED: { color: 'bg-green-100 text-green-700', label: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
      WITHDRAWN: { color: 'bg-slate-100 text-slate-700', label: 'Withdrawn' },
    };
    const badge = badges[status as keyof typeof badges] || badges.PENDING;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const RequestCard = ({ request, type }: { request: LinkRequest; type: 'received' | 'sent' }) => {
    const otherUser = type === 'received' ? request.sender : request.receiver;
    const isPending = request.status === 'PENDING';

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              {otherUser.photoUrl ? (
                <img
                  src={otherUser.photoUrl}
                  alt={otherUser.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl">👤</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-semibold text-lg">{otherUser.name}</h4>
                  <p className="text-sm text-slate-600">{otherUser.email}</p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              {otherUser.bio && (
                <p className="text-sm text-slate-600 mb-2">{otherUser.bio}</p>
              )}

              {otherUser.location && (
                <p className="text-xs text-slate-500 mb-2">📍 {otherUser.location}</p>
              )}

              <div className="bg-slate-50 rounded-lg p-3 mb-3">
                <p className="text-sm">
                  <strong>Relationship:</strong> {request.relationshipType}
                </p>
                {request.message && (
                  <p className="text-sm mt-2">
                    <strong>Message:</strong> "{request.message}"
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-2">{formatDate(request.createdAt)}</p>
              </div>

              {/* Actions for received pending requests */}
              {type === 'received' && isPending && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAction(request.id, 'approve')}
                    disabled={actionLoading === request.id}
                    className="flex-1"
                  >
                    {actionLoading === request.id ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(request.id, 'reject')}
                    disabled={actionLoading === request.id}
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              )}

              {/* Actions for sent pending requests */}
              {type === 'sent' && isPending && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(request.id, 'withdraw')}
                  disabled={actionLoading === request.id}
                  className="w-full"
                >
                  {actionLoading === request.id ? 'Processing...' : 'Withdraw Request'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading link requests...</p>
        </div>
      </div>
    );
  }

  const pendingReceived = receivedRequests.filter((r) => r.status === 'PENDING');
  const pendingSent = sentRequests.filter((r) => r.status === 'PENDING');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Link Requests</h1>
              <p className="text-slate-600">Connect with your relatives</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              ← Back to Dashboard
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="received">
                Received {pendingReceived.length > 0 && `(${pendingReceived.length})`}
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent {pendingSent.length > 0 && `(${pendingSent.length})`}
              </TabsTrigger>
            </TabsList>

            {/* Received Requests Tab */}
            <TabsContent value="received" className="space-y-4 mt-6">
              {receivedRequests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-6xl mb-4">📬</div>
                    <h3 className="text-xl font-semibold mb-2">No received requests</h3>
                    <p className="text-slate-600">
                      You haven't received any link requests yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {pendingReceived.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Pending Requests</h3>
                      {pendingReceived.map((request) => (
                        <RequestCard key={request.id} request={request} type="received" />
                      ))}
                    </div>
                  )}

                  {receivedRequests.filter((r) => r.status !== 'PENDING').length > 0 && (
                    <div className="space-y-3 mt-6">
                      <h3 className="font-semibold text-lg">Past Requests</h3>
                      {receivedRequests
                        .filter((r) => r.status !== 'PENDING')
                        .map((request) => (
                          <RequestCard key={request.id} request={request} type="received" />
                        ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Sent Requests Tab */}
            <TabsContent value="sent" className="space-y-4 mt-6">
              {sentRequests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-6xl mb-4">📤</div>
                    <h3 className="text-xl font-semibold mb-2">No sent requests</h3>
                    <p className="text-slate-600 mb-4">
                      You haven't sent any link requests yet
                    </p>
                    <p className="text-sm text-slate-500">
                      Search for users and send them a link request to connect your family trees
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {pendingSent.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Pending Requests</h3>
                      {pendingSent.map((request) => (
                        <RequestCard key={request.id} request={request} type="sent" />
                      ))}
                    </div>
                  )}

                  {sentRequests.filter((r) => r.status !== 'PENDING').length > 0 && (
                    <div className="space-y-3 mt-6">
                      <h3 className="font-semibold text-lg">Past Requests</h3>
                      {sentRequests
                        .filter((r) => r.status !== 'PENDING')
                        .map((request) => (
                          <RequestCard key={request.id} request={request} type="sent" />
                        ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Info Card */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div className="text-sm text-blue-900">
                  <strong>How Link Requests Work:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Send a request to another user to connect your family trees</li>
                    <li>They can approve or reject your request</li>
                    <li>Once approved, you can view each other's trees (based on privacy settings)</li>
                    <li>You can withdraw pending requests at any time</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
