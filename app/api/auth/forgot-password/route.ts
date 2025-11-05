import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateOTP } from '@/lib/auth/otp';
import { EmailService } from '@/lib/integrations/email';
import { WhatsAppService } from '@/lib/integrations/whatsapp';

const requestSchema = z.object({
  emailOrMobile: z.string().min(1, 'Email or mobile is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrMobile } = requestSchema.parse(body);

    // Find user by email or mobile
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrMobile },
          { mobile: emailOrMobile },
        ],
      },
    });

    // Always return success to prevent user enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists, you will receive reset instructions.' },
        { status: 200 }
      );
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await prisma.oTPCode.create({
      data: {
        userId: user.id,
        mobile: user.mobile,
        email: user.email,
        code: otp,
        type: 'password_reset',
        expiresAt,
      },
    });

    // Send OTP via email
    try {
      await EmailService.sendPasswordResetEmail(
        user.email,
        user.name,
        otp
      );
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
    }

    // Send OTP via WhatsApp
    try {
      await WhatsAppService.sendOTP(user.mobile, otp);
    } catch (whatsappError) {
      console.error('Failed to send reset OTP via WhatsApp:', whatsappError);
    }

    return NextResponse.json(
      { message: 'Password reset instructions sent to your email and mobile.' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
