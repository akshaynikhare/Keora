'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GettingStartedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const steps = [
    {
      number: 1,
      title: 'Welcome to Keora!',
      description: 'Your family tree journey starts here',
      icon: '👋',
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Keora helps you build, preserve, and share your family history. Let's get you started with the basics.
          </p>
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h4 className="font-semibold text-primary-900 mb-2">What you can do:</h4>
            <ul className="space-y-2 text-sm text-primary-800">
              <li>✅ Build your family tree with photos and details</li>
              <li>✅ Connect with relatives for collaborative trees</li>
              <li>✅ Control who can see your family information</li>
              <li>✅ Preserve your family history for future generations</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      number: 2,
      title: 'Add Your First Family Member',
      description: 'Start by adding yourself to your family tree',
      icon: '👤',
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Every family tree starts with you! Create your profile as the primary member of your tree.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-blue-900">What information to include:</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li><strong>Name:</strong> Your full name (required)</li>
              <li><strong>Photo:</strong> A profile picture (optional but recommended)</li>
              <li><strong>Date of Birth:</strong> Helps organize your tree chronologically</li>
              <li><strong>Location:</strong> Where you live or were born</li>
              <li><strong>Bio:</strong> A brief description about yourself</li>
            </ul>
          </div>
          <Button
            onClick={() => router.push('/family/members')}
            className="w-full"
            size="lg"
          >
            Add Yourself to Your Tree
          </Button>
        </div>
      ),
    },
    {
      number: 3,
      title: 'Build Your Family Tree',
      description: 'Add parents, siblings, spouse, and children',
      icon: '🌳',
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Once you've added yourself, start building your tree by adding immediate family members.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Start with immediate family:</h4>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• Parents</li>
                <li>• Siblings</li>
                <li>• Spouse/Partner</li>
                <li>• Children</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Then expand further:</h4>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• Grandparents</li>
                <li>• Aunts & Uncles</li>
                <li>• Cousins</li>
                <li>• Extended family</li>
              </ul>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              💡 <strong>Tip:</strong> After adding members, don't forget to define relationships between them
              (parent-child, spouse, siblings) to create a complete tree structure.
            </p>
          </div>
        </div>
      ),
    },
    {
      number: 4,
      title: 'Set Your Privacy Preferences',
      description: 'Control who can see your family tree',
      icon: '🔒',
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            You have full control over who can view your family information. Choose the privacy level that works for you.
          </p>
          <div className="space-y-3">
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h4 className="font-semibold text-slate-900">Private</h4>
                  <p className="text-sm text-slate-600">Only you can see your tree. Perfect for personal records.</p>
                </div>
              </div>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <h4 className="font-semibold text-slate-900">Family</h4>
                  <p className="text-sm text-slate-600">Only users you've approved can see your tree. Great for collaboration.</p>
                </div>
              </div>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌍</span>
                <div>
                  <h4 className="font-semibold text-slate-900">Public</h4>
                  <p className="text-sm text-slate-600">Anyone can search and view your tree. Helps distant relatives find you.</p>
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={() => router.push('/family/settings')}
            className="w-full"
            variant="outline"
          >
            Configure Privacy Settings
          </Button>
        </div>
      ),
    },
    {
      number: 5,
      title: 'Connect with Relatives',
      description: 'Find and link with family members',
      icon: '🤝',
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Keora allows you to connect with other users who are your relatives, creating a collaborative family network.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-purple-900">How link requests work:</h4>
            <ol className="space-y-2 text-sm text-purple-800 list-decimal list-inside">
              <li>Search for a user by name or email</li>
              <li>Send them a link request with your relationship (parent, sibling, etc.)</li>
              <li>They review and approve or decline your request</li>
              <li>Once approved, you can view each other's trees (based on privacy settings)</li>
            </ol>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-800">
              🔐 <strong>Safe & Secure:</strong> All connections require mutual approval. You're always in control of who can access your family information.
            </p>
          </div>
          <Button
            onClick={() => router.push('/family/links')}
            className="w-full"
            variant="outline"
          >
            Manage Link Requests
          </Button>
        </div>
      ),
    },
    {
      number: 6,
      title: 'You're All Set!',
      description: 'Start building your family legacy',
      icon: '🎉',
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Congratulations! You now know the basics of Keora. Start building your family tree and preserving your heritage today.
          </p>
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-6 space-y-4">
            <h4 className="font-semibold text-slate-900 text-lg">Quick Links:</h4>
            <div className="grid gap-3">
              <Button
                onClick={() => router.push('/family/members')}
                className="w-full justify-start"
                variant="secondary"
              >
                <span className="mr-2">👤</span>
                Manage Family Members
              </Button>
              <Button
                onClick={() => router.push('/family/tree')}
                className="w-full justify-start"
                variant="secondary"
              >
                <span className="mr-2">🌳</span>
                View Family Tree
              </Button>
              <Button
                onClick={() => router.push('/family/links')}
                className="w-full justify-start"
                variant="secondary"
              >
                <span className="mr-2">🤝</span>
                Connect with Relatives
              </Button>
              <Button
                onClick={() => router.push('/family/settings')}
                className="w-full justify-start"
                variant="secondary"
              >
                <span className="mr-2">⚙️</span>
                Tree Settings
              </Button>
            </div>
          </div>
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full"
            size="lg"
          >
            Go to Dashboard
          </Button>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm text-slate-500">
                {Math.round((currentStep / steps.length) * 100)}% Complete
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="text-6xl mb-4">{currentStepData.icon}</div>
              <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
              <CardDescription className="text-base">
                {currentStepData.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {currentStepData.content}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
                <Button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  variant="outline"
                  disabled={currentStep === 1}
                  className="flex-1"
                >
                  Previous
                </Button>
                {currentStep < steps.length ? (
                  <Button
                    onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                    className="flex-1"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1"
                  >
                    Finish
                  </Button>
                )}
              </div>

              {/* Skip Option */}
              <div className="text-center mt-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  Skip tutorial
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {steps.map((step) => (
              <button
                key={step.number}
                onClick={() => setCurrentStep(step.number)}
                className={`h-2 rounded-full transition-all ${
                  step.number === currentStep
                    ? 'w-8 bg-primary'
                    : step.number < currentStep
                    ? 'w-2 bg-primary-300'
                    : 'w-2 bg-slate-300'
                }`}
                aria-label={`Go to step ${step.number}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
