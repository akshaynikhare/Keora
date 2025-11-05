'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FlaggedContent {
  id: string;
  contentType: string;
  contentId: string;
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ModerationPage() {
  const { token } = useAuthStore();
  const { toast } = useToast();

  const [flags, setFlags] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFlag, setSelectedFlag] = useState<FlaggedContent | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchFlags();
  }, [statusFilter, page]);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/moderation?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch flags');

      const data = await res.json();
      setFlags(data.flags);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (flag: FlaggedContent, action: string) => {
    setSelectedFlag(flag);
    setReviewAction(action);
    setReviewNotes('');
    setReviewDialog(true);
  };

  const handleReview = async () => {
    if (!selectedFlag) return;

    try {
      setActionLoading(true);

      const res = await fetch(`/api/admin/moderation/${selectedFlag.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: reviewAction,
          reviewNotes,
        }),
      });

      if (!res.ok) throw new Error('Review action failed');

      toast({
        title: 'Success',
        description: `Content ${reviewAction} successful`,
      });

      setReviewDialog(false);
      setSelectedFlag(null);
      setReviewNotes('');
      fetchFlags();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getReasonBadgeColor = (reason: string) => {
    switch (reason) {
      case 'SPAM':
        return 'warning';
      case 'INAPPROPRIATE':
        return 'destructive';
      case 'FAKE_PROFILE':
        return 'destructive';
      case 'HARASSMENT':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'REVIEWED':
        return 'secondary';
      case 'APPROVED':
        return 'success';
      case 'REMOVED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
        <p className="mt-2 text-gray-600">Review and moderate flagged content</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter('PENDING')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {flags.filter((f) => f.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter('REVIEWED')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Reviewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {flags.filter((f) => f.status === 'REVIEWED').length}
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter('APPROVED')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {flags.filter((f) => f.status === 'APPROVED').length}
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter('REMOVED')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Removed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {flags.filter((f) => f.status === 'REMOVED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-48 px-3 py-2 border border-gray-300 rounded-md"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="PENDING">Pending</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="APPROVED">Approved</option>
                <option value="REMOVED">Removed</option>
                <option value="ALL">All</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flags Table */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Content</CardTitle>
          <CardDescription>Review and take action on reported content</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : flags.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No flagged content found with selected filters
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flags.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{flag.contentType}</p>
                          <p className="text-xs text-gray-500">ID: {flag.contentId.substring(0, 8)}...</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={getReasonBadgeColor(flag.reason) as any}>
                          {flag.reason}
                        </Badge>
                        {flag.description && (
                          <p className="text-xs text-gray-600 mt-1">{flag.description}</p>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{flag.reporter.name}</p>
                          <p className="text-gray-500">{flag.reporter.email}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={getStatusBadgeColor(flag.status) as any}>
                          {flag.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(flag.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>

                      <TableCell>
                        {flag.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReviewDialog(flag, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReviewDialog(flag, 'warn')}
                            >
                              Warn
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openReviewDialog(flag, 'remove')}
                            >
                              Remove
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openReviewDialog(flag, 'ban')}
                            >
                              Ban User
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            {flag.reviewer && (
                              <>
                                <p>Reviewed by: {flag.reviewer.name}</p>
                                {flag.reviewNotes && <p className="text-xs mt-1">{flag.reviewNotes}</p>}
                              </>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Flagged Content</DialogTitle>
            <DialogDescription>
              Action: <strong>{reviewAction}</strong> - Add review notes below
            </DialogDescription>
          </DialogHeader>

          {selectedFlag && (
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Content Type</label>
                <p className="text-sm text-gray-900">{selectedFlag.contentType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Reason</label>
                <p className="text-sm text-gray-900">{selectedFlag.reason}</p>
              </div>
              {selectedFlag.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedFlag.description}</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Review Notes</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              placeholder="Add notes about your decision..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReview} disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
