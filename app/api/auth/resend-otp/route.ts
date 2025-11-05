import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateOTP } from '@/lib/auth/otp';
import { EmailService } from '@/lib/integrations/email';
import { WhatsAppService } from '@/lib/integrations/whatsapp';

const requestSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  type: z.enum(['mobile', 'email'], { required_error: 'Type is required' }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type } = requestSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate old OTPs of the same type
    await prisma.oTPCode.updateMany({
      where: {
        userId: user.id,
        type: type === 'mobile' ? 'mobile_verification' : 'email_verification',
        used: false,
      },
      data: { used: true },
    });

    // Create new OTP
    await prisma.oTPCode.create({
      data: {
        userId: user.id,
        mobile: type === 'mobile' ? user.mobile : undefined,
        email: type === 'email' ? user.email : undefined,
        code: otp,
        type: type === 'mobile' ? 'mobile_verification' : 'email_verification',
        expiresAt,
      },
    });

    // Send OTP based on type
    if (type === 'email') {
      try {
        await EmailService.sendOTPEmail(user.email, otp);
      } catch (error) {
        console.error('Failed to send email OTP:', error);
        return NextResponse.json(
          { error: 'Failed to send email OTP' },
          { status: 500 }
        );
      }
    } else {
      try {
        await WhatsAppService.sendOTP(user.mobile, otp);
      } catch (error) {
        console.error('Failed to send mobile OTP:', error);
        return NextResponse.json(
          { error: 'Failed to send mobile OTP' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: `OTP sent successfully to ${type}` },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to resend OTP' },
      { status: 500 }
    );
  }
}
