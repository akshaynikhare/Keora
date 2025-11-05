import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const loginSchema = z.object({
  emailOrMobile: z.string().min(1, 'Email or mobile is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Apply rate limiting
    const rateLimitResult = applyRateLimit(request, RATE_LIMITS.LOGIN);
    if (!rateLimitResult.allowed) {
      const resetIn = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${resetIn} minutes.` },
        { status: 429 }
      );
    }

    // Find user by email or mobile
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.emailOrMobile },
          { mobile: validatedData.emailOrMobile },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.` },
        { status: 403 }
      );
    }

    // Check if account is suspended
    if (user.isSuspended) {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password);

    if (!isValidPassword) {
      // Increment failed login attempts
      const newAttempts = user.loginAttempts + 1;
      const updateData: any = {
        loginAttempts: newAttempts,
      };

      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (!user.verifiedAt) {
      return NextResponse.json(
        { error: 'Please verify your mobile and email first', userId: user.id },
        { status: 403 }
      );
    }

    // Update last login and reset login attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      mobile: user.mobile,
    });

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        photoUrl: user.photoUrl,
        isAdmin: user.isAdmin,
        adminRole: user.adminRole,
        verifiedAt: user.verifiedAt ? user.verifiedAt.toISOString() : null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
