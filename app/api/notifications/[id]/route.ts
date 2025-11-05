import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/notifications/[id]
 * Mark a specific notification as read
 */
export async function PATCH(
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

    // Check if notification exists and belongs to the user
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Mark as read if not already read
    if (!notification.readAt) {
      await prisma.notification.update({
        where: { id },
        data: { readAt: new Date() },
      });
    }

    return NextResponse.json(
      { message: 'Notification marked as read' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a notification
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

    // Check if notification exists and belongs to the user
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Notification deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
