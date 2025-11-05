import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';
import { prisma } from '@/lib/prisma';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export async function authenticate(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  // Verify user still exists
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    return null;
  }

  return payload;
}

export function requireAuth(handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

export async function verifyAuth(request: NextRequest): Promise<{
  authenticated: boolean;
  user: (JWTPayload & { id: string }) | null;
}> {
  const payload = await authenticate(request);

  if (!payload) {
    return {
      authenticated: false,
      user: null,
    };
  }

  return {
    authenticated: true,
    user: {
      ...payload,
      id: payload.userId,
    },
  };
}
