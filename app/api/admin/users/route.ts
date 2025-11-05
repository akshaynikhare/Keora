import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminResponse } from '@/lib/auth/admin-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Check admin authentication
  const admin = await requireAdmin(request);
  if (!admin) {
    return createAdminResponse('Unauthorized. Admin access required.', 401);
  }

  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const verified = searchParams.get('verified'); // 'true', 'false', or null
    const suspended = searchParams.get('suspended'); // 'true', 'false', or null
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
      ];
    }

    // Verified filter
    if (verified === 'true') {
      where.verifiedAt = { not: null };
    } else if (verified === 'false') {
      where.verifiedAt = null;
    }

    // Suspended filter
    if (suspended === 'true') {
      where.isSuspended = true;
    } else if (suspended === 'false') {
      where.isSuspended = false;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          photoUrl: true,
          verifiedAt: true,
          lastLogin: true,
          isAdmin: true,
          adminRole: true,
          isSuspended: true,
          suspendedAt: true,
          suspendedReason: true,
          createdAt: true,
          _count: {
            select: {
              familyMembers: true,
              sentRequests: true,
              receivedRequests: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json(
      {
        users: users.map((user) => ({
          ...user,
          isVerified: !!user.verifiedAt,
          familyMembersCount: user._count.familyMembers,
          sentRequestsCount: user._count.sentRequests,
          receivedRequestsCount: user._count.receivedRequests,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin users list error:', error);
    return createAdminResponse('Failed to fetch users', 500);
  }
}
