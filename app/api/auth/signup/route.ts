import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { createOTPCode } from '@/lib/auth/otp';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid mobile number'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  dob: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = applyRateLimit(request, RATE_LIMITS.SIGNUP);
    if (!rateLimitResult.allowed) {
      const resetIn = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Too many signup attempts. Try again in ${resetIn} minutes.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { mobile: validatedData.mobile },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or mobile already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        mobile: validatedData.mobile,
        email: validatedData.email,
        password: hashedPassword,
        dob: validatedData.dob ? new Date(validatedData.dob) : null,
      },
    });

    // Generate OTPs
    const mobileOTP = await createOTPCode('mobile_verification', {
      userId: user.id,
      mobile: user.mobile,
    });

    const emailOTP = await createOTPCode('email_verification', {
      userId: user.id,
      email: user.email,
    });

    // TODO: Send OTPs via WhatsApp and Email
    // This will be implemented in the next steps

    return NextResponse.json({
      message: 'User created successfully. Please verify your mobile and email.',
      userId: user.id,
      // In development, return OTPs (remove in production)
      ...(process.env.NODE_ENV === 'development' && {
        dev_mobile_otp: mobileOTP,
        dev_email_otp: emailOTP,
      }),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
