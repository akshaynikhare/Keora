import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updating tree settings
const updateTreeSettingsSchema = z.object({
  visibility: z.enum(['PRIVATE', 'FAMILY', 'PUBLIC']).optional(),
  allowSearch: z.boolean().optional(),
  showDob: z.boolean().optional(),
  showLocation: z.boolean().optional(),
});

/**
 * GET /api/tree-settings
 * Get tree settings for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;

    // Get or create tree settings
    let settings = await prisma.treeSettings.findUnique({
      where: { userId },
    });

    // If settings don't exist, create default settings
    if (!settings) {
      settings = await prisma.treeSettings.create({
        data: {
          userId,
          visibility: 'PRIVATE',
          allowSearch: false,
          showDob: true,
          showLocation: true,
        },
      });
    }

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tree settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tree settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tree-settings
 * Update tree settings for the authenticated user
 */
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;
    const body = await request.json();

    // Validate request body
    const validation = updateTreeSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get or create tree settings
    let settings = await prisma.treeSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create new settings with provided data
      settings = await prisma.treeSettings.create({
        data: {
          userId,
          visibility: data.visibility || 'PRIVATE',
          allowSearch: data.allowSearch ?? false,
          showDob: data.showDob ?? true,
          showLocation: data.showLocation ?? true,
        },
      });
    } else {
      // Update existing settings
      const updateData: any = {};
      if (data.visibility !== undefined) updateData.visibility = data.visibility;
      if (data.allowSearch !== undefined) updateData.allowSearch = data.allowSearch;
      if (data.showDob !== undefined) updateData.showDob = data.showDob;
      if (data.showLocation !== undefined) updateData.showLocation = data.showLocation;

      settings = await prisma.treeSettings.update({
        where: { userId },
        data: updateData,
      });
    }

    return NextResponse.json(
      { message: 'Tree settings updated successfully', settings },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating tree settings:', error);
    return NextResponse.json(
      { error: 'Failed to update tree settings' },
      { status: 500 }
    );
  }
}
