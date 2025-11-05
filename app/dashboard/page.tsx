'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UserStats {
  familyMembers: number;
  connections: number;
  treeVisibility: 'PRIVATE' | 'FAMILY' | 'PUBLIC';
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [stats, setStats] = useState<UserStats>({
    familyMembers: 0,
    connections: 0,
    treeVisibility: 'PRIVATE',
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user || !isAuthenticated) return;

      try {
        const authToken = typeof window !== 'undefined' ? localStorage.getItem('keora-auth-storage') : null;
        if (!authToken) return;

        const authData = JSON.parse(authToken);
        const token = authData?.state?.token;

        if (!token) return;

        const response = await fetch('/api/user-stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats({
            familyMembers: data.familyMembers,
            connections: data.connections,
            treeVisibility: data.treeVisibility,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user, isAuthenticated]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Check if user is verified
  const isVerified = !!user.verifiedAt;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">Keora</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              {user.isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin')}
                >
                  Admin Dashboard
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Warning Banner */}
        {!isVerified && (
          <Card className="bg-amber-50 border-amber-200 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 text-lg">Email/Mobile Verification Required</h3>
                  <p className="text-sm text-amber-800 mt-1">
                    Please verify your email and mobile number to access family tree features.
                    You won't be able to add family members or use other features until your account is verified.
                  </p>
                  <Button
                    className="mt-3"
                    size="sm"
                    onClick={() => router.push(`/verify?userId=${user.id}`)}
                  >
                    Verify Now →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">Welcome to your Keora family tree dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Family Members</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="text-3xl font-bold text-gray-400">...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900">{stats.familyMembers}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.familyMembers === 0 ? 'Start building your tree' : 'Members in your tree'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Connections</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="text-3xl font-bold text-gray-400">...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900">{stats.connections}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.connections === 0 ? 'No connections yet' : 'Connected families'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Tree Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="text-3xl font-bold text-gray-400">...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900 capitalize">
                    {stats.treeVisibility.toLowerCase()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Change in settings</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              {isVerified
                ? 'Get started with building your family tree'
                : 'Verify your account to access these features'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              className="h-auto py-4 flex-col"
              variant="outline"
              onClick={() => isVerified && router.push('/family/tree')}
              disabled={!isVerified}
            >
              <span className="text-3xl mb-2">👥</span>
              <span className="font-semibold">View Your Family</span>
              <span className="text-xs text-gray-500 mt-1">See all family members</span>
            </Button>

            <Button
              className="h-auto py-4 flex-col"
              variant="outline"
              onClick={() => isVerified && router.push('/family/tree')}
              disabled={!isVerified}
            >
              <span className="text-3xl mb-2">🌳</span>
              <span className="font-semibold">View Your Family Tree</span>
              <span className="text-xs text-gray-500 mt-1">Visualize relationships</span>
            </Button>

            <Button
              className="h-auto py-4 flex-col"
              variant="outline"
              onClick={() => isVerified && router.push('/family/members')}
              disabled={!isVerified}
            >
              <span className="text-3xl mb-2">👤</span>
              <span className="font-semibold">Manage Members</span>
              <span className="text-xs text-gray-500 mt-1">Add & edit family members</span>
            </Button>

            <Button
              className="h-auto py-4 flex-col"
              variant="outline"
              onClick={() => isVerified && router.push('/family/links')}
              disabled={!isVerified}
            >
              <span className="text-3xl mb-2">🤝</span>
              <span className="font-semibold">Link Requests</span>
              <span className="text-xs text-gray-500 mt-1">Connect with relatives</span>
            </Button>

            <Button
              className="h-auto py-4 flex-col"
              variant="outline"
              onClick={() => isVerified && router.push('/family/settings')}
              disabled={!isVerified}
            >
              <span className="text-3xl mb-2">⚙️</span>
              <span className="font-semibold">Tree Settings</span>
              <span className="text-xs text-gray-500 mt-1">Privacy & sharing</span>
            </Button>

            <Button
              className="h-auto py-4 flex-col"
              variant="outline"
              onClick={() => isVerified && router.push('/family/tree?view=tree')}
              disabled={!isVerified}
            >
              <span className="text-3xl mb-2">📊</span>
              <span className="font-semibold">Tree Visualization</span>
              <span className="text-xs text-gray-500 mt-1">Interactive tree view</span>
            </Button>
          </CardContent>
        </Card>

        {/* Getting Started Guide */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Follow these steps to build your family tree</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/getting-started')}
              >
                View Tutorial
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">1</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Add yourself to the tree</h4>
                <p className="text-sm text-gray-600">Create your profile as the primary member</p>
                <Button
                  size="sm"
                  variant="link"
                  className="px-0 mt-1"
                  onClick={() => isVerified && router.push('/family/members')}
                  disabled={!isVerified}
                >
                  Add family member →
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Build your family tree</h4>
                <p className="text-sm text-gray-600">Add parents, siblings, spouse, and children</p>
                <Button
                  size="sm"
                  variant="link"
                  className="px-0 mt-1"
                  onClick={() => isVerified && router.push('/family/members')}
                  disabled={!isVerified}
                >
                  Manage members →
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">3</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Set your privacy preferences</h4>
                <p className="text-sm text-gray-600">Control who can see your tree</p>
                <Button
                  size="sm"
                  variant="link"
                  className="px-0 mt-1"
                  onClick={() => isVerified && router.push('/family/settings')}
                  disabled={!isVerified}
                >
                  Configure settings →
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">4</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Connect with relatives</h4>
                <p className="text-sm text-gray-600">Find and link with family members on Keora</p>
                <Button
                  size="sm"
                  variant="link"
                  className="px-0 mt-1"
                  onClick={() => isVerified && router.push('/family/links')}
                  disabled={!isVerified}
                >
                  View link requests →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
