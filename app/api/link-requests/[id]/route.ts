import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updating link request
const updateLinkRequestSchema = z.object({
  action: z.enum(['approve', 'reject', 'withdraw']),
});

/**
 * PATCH /api/link-requests/[id]
 * Update a link request status (approve, reject, or withdraw)
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
    const body = await request.json();

    // Validate request body
    const validation = updateLinkRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { action } = validation.data;

    // Get the link request
    const linkRequest = await prisma.linkRequest.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!linkRequest) {
      return NextResponse.json(
        { error: 'Link request not found' },
        { status: 404 }
      );
    }

    // Check if request is still pending
    if (linkRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This request has already been ${linkRequest.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'approve': {
        // Only receiver can approve
        if (linkRequest.receiverId !== userId) {
          return NextResponse.json(
            { error: 'Only the receiver can approve this request' },
            { status: 403 }
          );
        }

        // Update request status
        const updated = await prisma.linkRequest.update({
          where: { id },
          data: { status: 'APPROVED' },
          include: {
            sender: true,
            receiver: true,
          },
        });

        // Create notification for sender
        await prisma.notification.create({
          data: {
            userId: linkRequest.senderId,
            type: 'LINK_APPROVED',
            title: 'Link Request Approved',
            content: `${linkRequest.receiver.name} accepted your link request. Your trees are now connected!`,
            link: '/dashboard/links',
          },
        });

        return NextResponse.json(
          { message: 'Link request approved successfully', request: updated },
          { status: 200 }
        );
      }

      case 'reject': {
        // Only receiver can reject
        if (linkRequest.receiverId !== userId) {
          return NextResponse.json(
            { error: 'Only the receiver can reject this request' },
            { status: 403 }
          );
        }

        // Update request status
        const updated = await prisma.linkRequest.update({
          where: { id },
          data: { status: 'REJECTED' },
          include: {
            sender: true,
            receiver: true,
          },
        });

        // Create notification for sender
        await prisma.notification.create({
          data: {
            userId: linkRequest.senderId,
            type: 'LINK_REJECTED',
            title: 'Link Request Declined',
            content: `${linkRequest.receiver.name} declined your link request.`,
            link: '/dashboard/links',
          },
        });

        return NextResponse.json(
          { message: 'Link request rejected successfully', request: updated },
          { status: 200 }
        );
      }

      case 'withdraw': {
        // Only sender can withdraw
        if (linkRequest.senderId !== userId) {
          return NextResponse.json(
            { error: 'Only the sender can withdraw this request' },
            { status: 403 }
          );
        }

        // Update request status
        const updated = await prisma.linkRequest.update({
          where: { id },
          data: { status: 'WITHDRAWN' },
          include: {
            sender: true,
            receiver: true,
          },
        });

        return NextResponse.json(
          { message: 'Link request withdrawn successfully', request: updated },
          { status: 200 }
        );
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating link request:', error);
    return NextResponse.json(
      { error: 'Failed to update link request' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/link-requests/[id]
 * Delete a link request (only if it's withdrawn or rejected)
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

    // Get the link request
    const linkRequest = await prisma.linkRequest.findUnique({
      where: { id },
    });

    if (!linkRequest) {
      return NextResponse.json(
        { error: 'Link request not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to delete
    if (linkRequest.senderId !== userId && linkRequest.receiverId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this request' },
        { status: 403 }
      );
    }

    // Only allow deletion of withdrawn or rejected requests
    if (linkRequest.status !== 'WITHDRAWN' && linkRequest.status !== 'REJECTED') {
      return NextResponse.json(
        { error: 'Only withdrawn or rejected requests can be deleted' },
        { status: 400 }
      );
    }

    // Delete the request
    await prisma.linkRequest.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Link request deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting link request:', error);
    return NextResponse.json(
      { error: 'Failed to delete link request' },
      { status: 500 }
    );
  }
}
