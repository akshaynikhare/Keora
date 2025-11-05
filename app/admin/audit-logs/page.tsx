'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuditLogsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-2 text-gray-600">View administrative actions and system events</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin')}>
          ← Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrative Activity</CardTitle>
          <CardDescription>Track all admin actions for security and compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">No Audit Logs Yet</h3>
            <p className="text-gray-600 mb-4">
              Audit logs will appear here as administrators perform actions on the platform.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-left max-w-2xl mx-auto">
              <h4 className="font-semibold text-blue-900 mb-2">What Gets Logged:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>User verification and suspension actions</li>
                <li>Content moderation decisions</li>
                <li>User account modifications</li>
                <li>System setting changes</li>
                <li>Password resets initiated by admins</li>
                <li>Failed login attempts and security events</li>
              </ul>
              <p className="text-sm text-blue-800 mt-3">
                <strong>Note:</strong> All logs include timestamp, admin name, IP address, and action details
                for full accountability and security auditing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
