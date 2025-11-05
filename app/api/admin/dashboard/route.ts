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
    // Get date ranges for statistics
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Fetch statistics in parallel
    const [
      totalUsers,
      verifiedUsers,
      newUsers30Days,
      newUsersToday,
      activeUsers7Days,
      totalFamilyMembers,
      totalRelationships,
      pendingLinkRequests,
      flaggedContent,
      recentUsers,
      userGrowth,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Verified users
      prisma.user.count({
        where: { verifiedAt: { not: null } },
      }),

      // New users in last 30 days
      prisma.user.count({
        where: { createdAt: { gte: last30Days } },
      }),

      // New users today
      prisma.user.count({
        where: { createdAt: { gte: today } },
      }),

      // Active users in last 7 days
      prisma.user.count({
        where: { lastLogin: { gte: last7Days } },
      }),

      // Total family members
      prisma.familyMember.count(),

      // Total relationships
      prisma.relationship.count(),

      // Pending link requests
      prisma.linkRequest.count({
        where: { status: 'PENDING' },
      }),

      // Flagged content
      prisma.flaggedContent.count({
        where: { status: 'PENDING' },
      }),

      // Recent users
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          verifiedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // User growth over last 30 days (daily)
      prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count
        FROM "User"
        WHERE created_at >= ${last30Days}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    // Calculate statistics
    const stats = {
      overview: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
        newUsers30Days,
        newUsersToday,
        activeUsers7Days,
        verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
      },
      content: {
        totalFamilyMembers,
        totalRelationships,
        pendingLinkRequests,
        flaggedContent,
      },
      growth: {
        daily: userGrowth,
        trend: newUsers30Days > 0 ? 'up' : 'neutral',
      },
      recentActivity: {
        recentUsers: recentUsers.map((user) => ({
          ...user,
          isVerified: !!user.verifiedAt,
        })),
      },
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return createAdminResponse('Failed to fetch dashboard stats', 500);
  }
}
