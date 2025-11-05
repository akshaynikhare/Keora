'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
  createdAt: string;
  admin: {
    id: string;
    name: string;
    email: string;
    adminRole?: string;
  };
}

export default function AuditLogsPage() {
  const { token } = useAuthStore();
  const { toast } = useToast();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, targetTypeFilter, page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });

      if (actionFilter) params.append('action', actionFilter);
      if (targetTypeFilter) params.append('targetType', targetTypeFilter);

      const res = await fetch(`/api/admin/audit-logs?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch audit logs');

      const data = await res.json();
      setLogs(data.logs);
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

  const getActionBadgeColor = (action: string) => {
    if (action.includes('delete') || action.includes('banned') || action.includes('removed')) {
      return 'destructive';
    }
    if (action.includes('suspend')) {
      return 'warning';
    }
    if (action.includes('approved') || action.includes('verified')) {
      return 'success';
    }
    return 'secondary';
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-2 text-gray-600">View all admin actions and system events</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Actions</option>
                <option value="user_suspended">User Suspended</option>
                <option value="user_unsuspended">User Unsuspended</option>
                <option value="user_deleted">User Deleted</option>
                <option value="user_verified">User Verified</option>
                <option value="user_password_reset">Password Reset</option>
                <option value="content_approved">Content Approved</option>
                <option value="content_removed">Content Removed</option>
                <option value="user_warned">User Warned</option>
                <option value="user_banned">User Banned</option>
                <option value="settings_updated">Settings Updated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={targetTypeFilter}
                onChange={(e) => {
                  setTargetTypeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Types</option>
                <option value="user">User</option>
                <option value="content">Content</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Chronological record of all admin actions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No audit logs found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-500">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{log.admin.name}</p>
                          <p className="text-gray-500">{log.admin.email}</p>
                          {log.admin.adminRole && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {log.admin.adminRole}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={getActionBadgeColor(log.action) as any}>
                          {formatAction(log.action)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {log.targetType && (
                          <div className="text-sm">
                            <p className="font-medium text-gray-700">
                              {log.targetType.charAt(0).toUpperCase() + log.targetType.slice(1)}
                            </p>
                            {log.targetId && (
                              <p className="text-xs text-gray-500 font-mono">
                                {log.targetId.substring(0, 12)}...
                              </p>
                            )}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-gray-600 font-mono">
                          {log.ipAddress || 'N/A'}
                        </span>
                      </TableCell>

                      <TableCell>
                        {log.details && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setExpandedLog(expandedLog === log.id ? null : log.id)
                            }
                          >
                            {expandedLog === log.id ? 'Hide' : 'View'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Expanded Details */}
              {expandedLog && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">Action Details</h4>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(
                      logs.find((l) => l.id === expandedLog)?.details,
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
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

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle>Export Logs</CardTitle>
          <CardDescription>Download audit logs for compliance and analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" disabled>
              Export as CSV
            </Button>
            <Button variant="outline" disabled>
              Export as JSON
            </Button>
            <p className="text-sm text-gray-500 self-center">
              Export functionality coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
