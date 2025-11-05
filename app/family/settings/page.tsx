'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface TreeSettings {
  visibility: 'PRIVATE' | 'FAMILY' | 'PUBLIC';
  allowSearch: boolean;
  showDob: boolean;
  showLocation: boolean;
}

export default function TreeSettingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<TreeSettings>({
    visibility: 'PRIVATE',
    allowSearch: false,
    showDob: true,
    showLocation: true,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchSettings();
  }, [isAuthenticated, router]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('keora-auth-storage');
      const parsedToken = token ? JSON.parse(token) : null;
      const authToken = parsedToken?.state?.token;

      if (!authToken) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/tree-settings', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSettings(data.settings);
      } else {
        throw new Error(data.error || 'Failed to fetch settings');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem('keora-auth-storage');
      const parsedToken = token ? JSON.parse(token) : null;
      const authToken = parsedToken?.state?.token;

      const response = await fetch('/api/tree-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Settings saved successfully',
        });
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-slate-900">Tree Settings</h1>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                ← Back
              </Button>
            </div>
            <p className="text-slate-600">
              Control who can see your family tree and what information is visible
            </p>
          </div>

          <div className="space-y-6">
            {/* Tree Visibility */}
            <Card>
              <CardHeader>
                <CardTitle>Tree Visibility</CardTitle>
                <CardDescription>
                  Choose who can view your family tree
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="visibility"
                      value="PRIVATE"
                      checked={settings.visibility === 'PRIVATE'}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          visibility: e.target.value as 'PRIVATE' | 'FAMILY' | 'PUBLIC',
                          allowSearch: false,
                        })
                      }
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        🔒 Private
                      </div>
                      <p className="text-sm text-slate-600">
                        Only you can see your tree. Perfect for personal records and initial tree building.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="visibility"
                      value="FAMILY"
                      checked={settings.visibility === 'FAMILY'}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          visibility: e.target.value as 'PRIVATE' | 'FAMILY' | 'PUBLIC',
                        })
                      }
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        👥 Family
                      </div>
                      <p className="text-sm text-slate-600">
                        Only users you've approved through link requests can see your tree. Great for collaboration
                        with known relatives.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="visibility"
                      value="PUBLIC"
                      checked={settings.visibility === 'PUBLIC'}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          visibility: e.target.value as 'PRIVATE' | 'FAMILY' | 'PUBLIC',
                        })
                      }
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        🌍 Public
                      </div>
                      <p className="text-sm text-slate-600">
                        Anyone can search and view your tree. Helps distant relatives discover and connect with you.
                      </p>
                    </div>
                  </label>
                </div>

                {settings.visibility === 'PUBLIC' && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-xl">⚠️</span>
                    <div className="text-sm text-amber-800">
                      <strong>Public trees are searchable</strong> and can be viewed by anyone on the internet. Make
                      sure you're comfortable with this level of visibility before enabling.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Search Settings</CardTitle>
                <CardDescription>
                  Control if others can find you in search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Allow search discovery</Label>
                    <p className="text-sm text-slate-600 mt-1">
                      Let other users find you when searching by name or email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowSearch}
                      onChange={(e) =>
                        setSettings({ ...settings, allowSearch: e.target.checked })
                      }
                      disabled={settings.visibility === 'PRIVATE'}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                {settings.visibility === 'PRIVATE' && (
                  <p className="text-xs text-slate-500 mt-2">
                    Search discovery is automatically disabled for private trees
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Information Visibility</CardTitle>
                <CardDescription>
                  Choose what information to show to others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="font-semibold">Show dates of birth</Label>
                    <p className="text-sm text-slate-600">
                      Display birth dates for family members
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showDob}
                      onChange={(e) =>
                        setSettings({ ...settings, showDob: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="font-semibold">Show locations</Label>
                    <p className="text-sm text-slate-600">
                      Display location information for family members
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showLocation}
                      onChange={(e) =>
                        setSettings({ ...settings, showLocation: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="flex-1" size="lg">
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div className="text-sm text-blue-900">
                    <strong>Privacy Note:</strong> Individual family members can have their own privacy settings that
                    override these tree-wide settings. Check each member's privacy level in the Family Members page.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
