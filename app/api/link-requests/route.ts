import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating link request
const createLinkRequestSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  relationshipType: z.enum(['PARENT', 'CHILD', 'SPOUSE', 'SIBLING']),
  message: z.string().max(500).optional(),
});

/**
 * GET /api/link-requests
 * Get all link requests for the authenticated user (sent and received)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'sent', 'received', or null for all

    let where: any = {};

    if (type === 'sent') {
      where = { senderId: userId };
    } else if (type === 'received') {
      where = { receiverId: userId };
    } else {
      where = {
        OR: [{ senderId: userId }, { receiverId: userId }],
      };
    }

    const requests = await prisma.linkRequest.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            photoUrl: true,
            bio: true,
            location: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            photoUrl: true,
            bio: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error('Error fetching link requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch link requests' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/link-requests
 * Create a new link request to connect with another user
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;
    const body = await request.json();

    // Validate request body
    const validation = createLinkRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { receiverId, relationshipType, message } = validation.data;

    // Validate that user can't send request to themselves
    if (userId === receiverId) {
      return NextResponse.json(
        { error: 'Cannot send a link request to yourself' },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver user not found' },
        { status: 404 }
      );
    }

    // Check if there's already a pending or approved request between these users
    const existingRequest = await prisma.linkRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId, status: { in: ['PENDING', 'APPROVED'] } },
          { senderId: receiverId, receiverId: userId, status: { in: ['PENDING', 'APPROVED'] } },
        ],
      },
    });

    if (existingRequest) {
      if (existingRequest.status === 'APPROVED') {
        return NextResponse.json(
          { error: 'You are already connected with this user' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'A pending link request already exists between you and this user' },
        { status: 400 }
      );
    }

    // Create link request
    const linkRequest = await prisma.linkRequest.create({
      data: {
        senderId: userId,
        receiverId,
        relationshipType,
        message: message || null,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            photoUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            photoUrl: true,
          },
        },
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'LINK_REQUEST',
        title: 'New Link Request',
        content: `${authResult.user.name} wants to connect with you. Review the request to accept or decline.`,
        link: '/dashboard/links',
      },
    });

    return NextResponse.json(
      { message: 'Link request sent successfully', request: linkRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating link request:', error);
    return NextResponse.json(
      { error: 'Failed to create link request' },
      { status: 500 }
    );
  }
}
