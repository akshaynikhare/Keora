import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user-stats
 * Get dashboard statistics for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;

    // Fetch all stats in parallel
    const [familyMemberCount, linkRequestsCount, treeSettings] = await Promise.all([
      // Count family members
      prisma.familyMember.count({
        where: { userId },
      }),

      // Count approved link requests (connections)
      prisma.linkRequest.count({
        where: {
          OR: [
            { senderId: userId, status: 'APPROVED' },
            { receiverId: userId, status: 'APPROVED' },
          ],
        },
      }),

      // Get tree settings
      prisma.treeSettings.findUnique({
        where: { userId },
        select: {
          visibility: true,
          allowSearchDiscovery: true,
          showBirthDates: true,
          showLocation: true,
        },
      }),
    ]);

    return NextResponse.json({
      familyMembers: familyMemberCount,
      connections: linkRequestsCount,
      treeVisibility: treeSettings?.visibility || 'PRIVATE',
      treeSettings: treeSettings || {
        visibility: 'PRIVATE',
        allowSearchDiscovery: false,
        showBirthDates: false,
        showLocation: false,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
