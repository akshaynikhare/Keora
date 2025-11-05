import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating family member
const createFamilyMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  photoUrl: z.string().url().optional().or(z.literal('')),
  dob: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  privacyLevel: z.enum(['PRIVATE', 'FAMILY', 'PUBLIC']).optional(),
  isPrimary: z.boolean().optional(),
});

/**
 * GET /api/family-members
 * Get all family members for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;

    // Get all family members for the user with their relationships
    const members = await prisma.familyMember.findMany({
      where: { userId },
      include: {
        relationshipsFrom: {
          include: {
            member2: true,
          },
        },
        relationshipsTo: {
          include: {
            member1: true,
          },
        },
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error('Error fetching family members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/family-members
 * Create a new family member
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
    const validation = createFamilyMemberSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if user already has a primary member when creating a primary member
    if (data.isPrimary) {
      const existingPrimary = await prisma.familyMember.findFirst({
        where: {
          userId,
          isPrimary: true,
        },
      });

      if (existingPrimary) {
        return NextResponse.json(
          { error: 'A primary family member already exists' },
          { status: 400 }
        );
      }
    }

    // Create family member
    const member = await prisma.familyMember.create({
      data: {
        userId,
        name: data.name,
        photoUrl: data.photoUrl || null,
        dob: data.dob ? new Date(data.dob) : null,
        gender: data.gender || null,
        bio: data.bio || null,
        location: data.location || null,
        privacyLevel: data.privacyLevel || 'FAMILY',
        isPrimary: data.isPrimary || false,
      },
    });

    return NextResponse.json(
      { message: 'Family member created successfully', member },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating family member:', error);
    return NextResponse.json(
      { error: 'Failed to create family member' },
      { status: 500 }
    );
  }
}
