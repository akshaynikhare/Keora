import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/relationships/[id]
 * Delete a relationship
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;
    const { id } = params;

    // Get the relationship with member details
    const relationship = await prisma.relationship.findUnique({
      where: { id },
      include: {
        member1: true,
        member2: true,
      },
    });

    if (!relationship) {
      return NextResponse.json(
        { error: 'Relationship not found' },
        { status: 404 }
      );
    }

    // Verify that at least one of the members belongs to the authenticated user
    if (
      relationship.member1.userId !== userId &&
      relationship.member2.userId !== userId
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this relationship' },
        { status: 403 }
      );
    }

    // Delete the relationship
    await prisma.relationship.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Relationship deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting relationship:', error);
    return NextResponse.json(
      { error: 'Failed to delete relationship' },
      { status: 500 }
    );
  }
}
