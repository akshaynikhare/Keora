import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { prisma } from '@/lib/prisma';

export async function requireAdmin(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return null;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        adminRole: true,
        isSuspended: true,
      },
    });

    // Check if user exists and is admin
    if (!user || !user.isAdmin || user.isSuspended) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Admin auth error:', error);
    return null;
  }
}

export async function requireSuperAdmin(request: NextRequest) {
  const user = await requireAdmin(request);

  if (!user || user.adminRole !== 'SUPER_ADMIN') {
    return null;
  }

  return user;
}

export function createAdminResponse(error: string, status: number = 403) {
  return NextResponse.json({ error }, { status });
}
