'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ModerationPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          <p className="mt-2 text-gray-600">Review and manage flagged content</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin')}>
          ← Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flagged Content</CardTitle>
          <CardDescription>Review reports from users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold mb-2">No Flagged Content</h3>
            <p className="text-gray-600 mb-4">
              There are currently no reports to review. When users flag content as inappropriate,
              it will appear here for moderation.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-left max-w-2xl mx-auto">
              <h4 className="font-semibold text-blue-900 mb-2">Moderation Features:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Review user-reported profiles and content</li>
                <li>Approve or remove flagged items</li>
                <li>Contact users about policy violations</li>
                <li>View reporting history and patterns</li>
                <li>Take action on repeat offenders</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
