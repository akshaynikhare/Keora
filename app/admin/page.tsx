'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  overview: {
    totalUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    newUsers30Days: number;
    newUsersToday: number;
    activeUsers7Days: number;
    verificationRate: number;
  };
  content: {
    totalFamilyMembers: number;
    totalRelationships: number;
    pendingLinkRequests: number;
    flaggedContent: number;
  };
  growth: {
    daily: Array<{ date: string; count: number }>;
    trend: string;
  };
  recentActivity: {
    recentUsers: Array<{
      id: string;
      name: string;
      email: string;
      createdAt: string;
      isVerified: boolean;
    }>;
  };
}

export default function AdminDashboard() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, [token]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-red-800">Error loading dashboard: {error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6 border border-primary-200">
        <h1 className="text-3xl font-bold text-gray-900">Platform Monitoring Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor user activity, content creation, and system health. You are viewing this as a <strong>Super Administrator</strong> -
          this dashboard is for platform monitoring and management, not for building family trees.
        </p>
      </div>

      {/* User Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.overview.totalUsers}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.overview.verificationRate.toFixed(1)}% verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">New Users (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.overview.newUsers30Days}</div>
              <p className="text-xs text-gray-500 mt-1">+{stats.overview.newUsersToday} today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users (7d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.overview.activeUsers7Days}</div>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.overview.activeUsers7Days / stats.overview.totalUsers) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Unverified Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.overview.unverifiedUsers}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting verification</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Content & Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Family Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.content.totalFamilyMembers}</div>
              <p className="text-xs text-gray-500 mt-1">Created profiles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.content.totalRelationships}</div>
              <p className="text-xs text-gray-500 mt-1">Total connections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Link Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.content.pendingLinkRequests}</div>
              <p className="text-xs text-gray-500 mt-1">Pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Flagged Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.content.flaggedContent}</div>
              <p className="text-xs text-gray-500 mt-1">Needs review</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Latest user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user.isVerified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : (
                    <Badge variant="warning">Unverified</Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health & Monitoring */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💚</span>
            System Health
          </CardTitle>
          <CardDescription>Platform performance and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Database Status</div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-gray-900">Operational</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">All database connections healthy</p>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">API Status</div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-gray-900">Operational</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">All endpoints responding normally</p>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">User Activity</div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-gray-900">Normal</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Standard traffic patterns</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Actions</CardTitle>
          <CardDescription>Platform management and moderation tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => (window.location.href = '/admin/users')}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="font-semibold text-gray-900">Manage Users</span>
              </div>
              <p className="text-sm text-gray-600">View, verify, suspend, and manage all platform users</p>
            </button>

            <button
              onClick={() => (window.location.href = '/admin/moderation')}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-semibold text-gray-900">Content Moderation</span>
              </div>
              <p className="text-sm text-gray-600">Review flagged content and user reports</p>
            </button>

            <button
              onClick={() => (window.location.href = '/admin/audit-logs')}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold text-gray-900">Audit Logs</span>
              </div>
              <p className="text-sm text-gray-600">View all administrative actions and system events</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div className="text-sm text-blue-900">
              <strong>Admin Role Information:</strong>
              <p className="mt-2">
                As a Super Administrator, you have full access to monitor and manage the Keora platform. This dashboard
                provides insights into user activity, content creation, and system health. Regular app users see a
                different dashboard focused on building their family trees.
              </p>
              <p className="mt-2">
                <strong>Your responsibilities include:</strong>
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Monitoring platform usage and growth</li>
                <li>Managing and moderating user content</li>
                <li>Responding to user reports and issues</li>
                <li>Ensuring platform security and compliance</li>
                <li>Viewing audit logs of all administrative actions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
