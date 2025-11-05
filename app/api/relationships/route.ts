import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating relationship
const createRelationshipSchema = z.object({
  memberId1: z.string().min(1, 'First member ID is required'),
  memberId2: z.string().min(1, 'Second member ID is required'),
  relationshipType: z.enum(['PARENT', 'CHILD', 'SPOUSE', 'SIBLING']),
});

/**
 * GET /api/relationships
 * Get all relationships for the authenticated user's family members
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;

    // Get all family members for the user
    const members = await prisma.familyMember.findMany({
      where: { userId },
      select: { id: true },
    });

    const memberIds = members.map((m) => m.id);

    // Get all relationships involving the user's family members
    const relationships = await prisma.relationship.findMany({
      where: {
        OR: [
          { memberId1: { in: memberIds } },
          { memberId2: { in: memberIds } },
        ],
      },
      include: {
        member1: true,
        member2: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ relationships }, { status: 200 });
  } catch (error) {
    console.error('Error fetching relationships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch relationships' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/relationships
 * Create a new relationship between family members
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
    const validation = createRelationshipSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { memberId1, memberId2, relationshipType } = validation.data;

    // Validate that members can't be related to themselves
    if (memberId1 === memberId2) {
      return NextResponse.json(
        { error: 'Cannot create a relationship between a member and themselves' },
        { status: 400 }
      );
    }

    // Verify both members belong to the user
    const member1 = await prisma.familyMember.findFirst({
      where: { id: memberId1, userId },
    });

    const member2 = await prisma.familyMember.findFirst({
      where: { id: memberId2, userId },
    });

    if (!member1 || !member2) {
      return NextResponse.json(
        { error: 'One or both family members not found' },
        { status: 404 }
      );
    }

    // Check if relationship already exists (in either direction)
    const existingRelationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          { memberId1, memberId2 },
          { memberId1: memberId2, memberId2: memberId1 },
        ],
      },
    });

    if (existingRelationship) {
      return NextResponse.json(
        { error: 'A relationship between these members already exists' },
        { status: 400 }
      );
    }

    // Create relationship
    const relationship = await prisma.relationship.create({
      data: {
        memberId1,
        memberId2,
        relationshipType,
      },
      include: {
        member1: true,
        member2: true,
      },
    });

    return NextResponse.json(
      { message: 'Relationship created successfully', relationship },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating relationship:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A relationship between these members already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create relationship' },
      { status: 500 }
    );
  }
}
