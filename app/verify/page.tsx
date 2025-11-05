'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const userId = searchParams?.get('userId');

  const [formData, setFormData] = useState({
    mobileOTP: '',
    emailOTP: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID is missing. Please sign up again.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.mobileOTP && !formData.emailOTP) {
      toast({
        title: 'OTP Required',
        description: 'Please enter at least one OTP code.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mobileOTP: formData.mobileOTP || undefined,
          emailOTP: formData.emailOTP || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      toast({
        title: 'Verification Successful!',
        description: 'Your account has been verified. You can now log in.',
      });

      // Redirect to login
      router.push('/login');
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async (type: 'mobile' | 'email') => {
    if (resendCooldown > 0) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      toast({
        title: 'OTP Resent',
        description: `A new OTP has been sent to your ${type}.`,
      });

      setResendCooldown(60); // 60 second cooldown
    } catch (error: any) {
      toast({
        title: 'Resend Failed',
        description: error.message || 'Could not resend OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Invalid Request</CardTitle>
            <CardDescription className="text-center">
              User ID is missing. Please sign up again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/signup">
              <Button>Go to Sign Up</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verify Your Account</CardTitle>
          <CardDescription className="text-center">
            Enter the OTP codes sent to your mobile and email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mobileOTP">Mobile OTP (WhatsApp)</Label>
              <Input
                id="mobileOTP"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={formData.mobileOTP}
                onChange={(e) => setFormData({ ...formData, mobileOTP: e.target.value.replace(/\D/g, '') })}
                disabled={isLoading}
                className="text-center text-2xl tracking-widest"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleResendOTP('mobile')}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-sm text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Mobile OTP'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailOTP">Email OTP</Label>
              <Input
                id="emailOTP"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={formData.emailOTP}
                onChange={(e) => setFormData({ ...formData, emailOTP: e.target.value.replace(/\D/g, '') })}
                disabled={isLoading}
                className="text-center text-2xl tracking-widest"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleResendOTP('email')}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-sm text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email OTP'}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You need to verify both your mobile number and email address to activate your account.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (!formData.mobileOTP && !formData.emailOTP)}
            >
              {isLoading ? 'Verifying...' : 'Verify Account'}
            </Button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-800">
                Already verified? Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
