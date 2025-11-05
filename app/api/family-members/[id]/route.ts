import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updating family member
const updateFamilyMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  photoUrl: z.string().url().optional().or(z.literal('')).or(z.null()),
  dob: z.string().optional().or(z.null()),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().or(z.null()),
  bio: z.string().max(500).optional().or(z.null()),
  location: z.string().max(200).optional().or(z.null()),
  privacyLevel: z.enum(['PRIVATE', 'FAMILY', 'PUBLIC']).optional(),
  isPrimary: z.boolean().optional(),
});

/**
 * GET /api/family-members/[id]
 * Get a specific family member with relationships
 */
export async function GET(
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

    // Get family member with relationships
    const member = await prisma.familyMember.findFirst({
      where: {
        id,
        userId, // Ensure the member belongs to the authenticated user
      },
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
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Family member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ member }, { status: 200 });
  } catch (error) {
    console.error('Error fetching family member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family member' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/family-members/[id]
 * Update a family member
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
    const validation = updateFamilyMemberSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Check if family member exists and belongs to the user
    const existingMember = await prisma.familyMember.findFirst({
      where: { id, userId },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Family member not found' },
        { status: 404 }
      );
    }

    const data = validation.data;

    // Check if trying to set as primary when another primary exists
    if (data.isPrimary && !existingMember.isPrimary) {
      const existingPrimary = await prisma.familyMember.findFirst({
        where: {
          userId,
          isPrimary: true,
          id: { not: id },
        },
      });

      if (existingPrimary) {
        return NextResponse.json(
          { error: 'A primary family member already exists. Remove primary status from the other member first.' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl || null;
    if (data.dob !== undefined) updateData.dob = data.dob ? new Date(data.dob) : null;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.privacyLevel !== undefined) updateData.privacyLevel = data.privacyLevel;
    if (data.isPrimary !== undefined) updateData.isPrimary = data.isPrimary;

    // Update family member
    const member = await prisma.familyMember.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      { message: 'Family member updated successfully', member },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating family member:', error);
    return NextResponse.json(
      { error: 'Failed to update family member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/family-members/[id]
 * Delete a family member
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

    // Check if family member exists and belongs to the user
    const member = await prisma.familyMember.findFirst({
      where: { id, userId },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Family member not found' },
        { status: 404 }
      );
    }

    // Delete family member (relationships will be deleted due to cascade)
    await prisma.familyMember.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Family member deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting family member:', error);
    return NextResponse.json(
      { error: 'Failed to delete family member' },
      { status: 500 }
    );
  }
}
