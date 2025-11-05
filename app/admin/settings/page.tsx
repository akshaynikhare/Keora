'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-2 text-gray-600">Configure platform-wide settings and preferences</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin')}>
          ← Back to Dashboard
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
            <CardDescription>Core platform configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Registration Settings</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p>• Email verification: Enabled</p>
                  <p>• Mobile verification: Enabled</p>
                  <p>• Auto-approve signups: Disabled</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Security Settings</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p>• Session timeout: 7 days</p>
                  <p>• Max login attempts: 5</p>
                  <p>• Account lock duration: 30 minutes</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Privacy Settings</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p>• Default tree visibility: Private</p>
                  <p>• Allow public search: User configurable</p>
                  <p>• Data retention period: Indefinite</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>Enable or disable platform features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p>• User registration: Enabled</p>
              <p>• Link requests: Enabled</p>
              <p>• Public tree search: Enabled</p>
              <p>• Social login (Google/Facebook): Disabled</p>
              <p>• Mobile app access: Disabled</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email & Notifications</CardTitle>
            <CardDescription>Configure communication settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p>• Email service: Not configured</p>
              <p>• SMS service: Not configured</p>
              <p>• Push notifications: Disabled</p>
              <p>• Welcome emails: Disabled (configure SMTP first)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="text-sm text-blue-900">
                <strong>Configuration Note:</strong>
                <p className="mt-2">
                  These settings are currently read-only and show the default platform configuration.
                  To modify these settings, you'll need to update environment variables and restart
                  the application.
                </p>
                <p className="mt-2">
                  For production deployments, consider using a configuration management system or
                  admin panel with proper authentication and audit logging.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
