import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminResponse } from '@/lib/auth/admin-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return createAdminResponse('Unauthorized. Admin access required.', 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'PENDING';
    const contentType = searchParams.get('contentType');

    const where: any = {};

    if (status !== 'ALL') {
      where.status = status;
    }

    if (contentType) {
      where.contentType = contentType;
    }

    const skip = (page - 1) * limit;

    const [flags, total] = await Promise.all([
      prisma.flaggedContent.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.flaggedContent.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        flags,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin moderation list error:', error);
    return createAdminResponse('Failed to fetch flagged content', 500);
  }
}
