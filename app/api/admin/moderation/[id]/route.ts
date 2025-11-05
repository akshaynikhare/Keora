import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminResponse } from '@/lib/auth/admin-middleware';
import { prisma } from '@/lib/prisma';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/admin/audit-log';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return createAdminResponse('Unauthorized. Admin access required.', 401);
  }

  try {
    const body = await request.json();
    const { action, reviewNotes } = body;

    const flag = await prisma.flaggedContent.findUnique({
      where: { id: params.id },
      include: {
        reporter: true,
      },
    });

    if (!flag) {
      return createAdminResponse('Flagged content not found', 404);
    }

    let newStatus: 'REVIEWED' | 'APPROVED' | 'REMOVED';
    let auditAction: string;
    let shouldSuspendUser = false;

    switch (action) {
      case 'approve':
        newStatus = 'APPROVED';
        auditAction = AUDIT_ACTIONS.CONTENT_APPROVED;
        break;

      case 'remove':
        newStatus = 'REMOVED';
        auditAction = AUDIT_ACTIONS.CONTENT_REMOVED;
        break;

      case 'warn':
        newStatus = 'REVIEWED';
        auditAction = AUDIT_ACTIONS.USER_WARNED;
        // Create notification for user
        await prisma.notification.create({
          data: {
            userId: flag.contentId, // Assuming contentId is userId for profile flags
            type: 'SYSTEM',
            title: 'Content Warning',
            content: `Your content was flagged and reviewed. Reason: ${flag.reason}. Notes: ${reviewNotes || 'No additional notes.'}`,
          },
        });
        break;

      case 'ban':
        newStatus = 'REMOVED';
        auditAction = AUDIT_ACTIONS.USER_BANNED;
        shouldSuspendUser = true;
        break;

      default:
        return createAdminResponse('Invalid action', 400);
    }

    // Update flagged content
    const updatedFlag = await prisma.flaggedContent.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
      },
    });

    // Suspend user if banned
    if (shouldSuspendUser && flag.contentType === 'profile') {
      await prisma.user.update({
        where: { id: flag.contentId },
        data: {
          isSuspended: true,
          suspendedAt: new Date(),
          suspendedReason: `Content violation: ${flag.reason}. ${reviewNotes || ''}`,
        },
      });
    }

    // Log action
    await createAuditLog({
      adminId: admin.id,
      action: auditAction,
      targetType: flag.contentType,
      targetId: flag.contentId,
      details: {
        flagId: flag.id,
        reason: flag.reason,
        reviewNotes,
        action,
      },
      request,
    });

    return NextResponse.json(
      {
        message: `Content ${action} successful`,
        flag: updatedFlag,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin moderation action error:', error);
    return createAdminResponse('Failed to process moderation action', 500);
  }
}
