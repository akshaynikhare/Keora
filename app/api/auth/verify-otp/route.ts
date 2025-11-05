import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyOTPCode } from '@/lib/auth/otp';

const verifyOTPSchema = z.object({
  userId: z.string(),
  mobileOTP: z.string().length(6, 'OTP must be 6 digits').optional(),
  emailOTP: z.string().length(6, 'OTP must be 6 digits').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verifyOTPSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let mobileVerified = false;
    let emailVerified = false;

    // Verify mobile OTP if provided
    if (validatedData.mobileOTP) {
      mobileVerified = await verifyOTPCode(
        validatedData.mobileOTP,
        'mobile_verification',
        { userId: user.id, mobile: user.mobile }
      );
    }

    // Verify email OTP if provided
    if (validatedData.emailOTP) {
      emailVerified = await verifyOTPCode(
        validatedData.emailOTP,
        'email_verification',
        { userId: user.id, email: user.email }
      );
    }

    if (!mobileVerified && validatedData.mobileOTP) {
      return NextResponse.json(
        { error: 'Invalid or expired mobile OTP' },
        { status: 400 }
      );
    }

    if (!emailVerified && validatedData.emailOTP) {
      return NextResponse.json(
        { error: 'Invalid or expired email OTP' },
        { status: 400 }
      );
    }

    // Update user verification status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Verification successful',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        verifiedAt: updatedUser.verifiedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
