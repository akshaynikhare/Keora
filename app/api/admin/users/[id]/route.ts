import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireSuperAdmin, createAdminResponse } from '@/lib/auth/admin-middleware';
import { prisma } from '@/lib/prisma';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/admin/audit-log';

// GET single user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return createAdminResponse('Unauthorized. Admin access required.', 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        familyMembers: {
          select: {
            id: true,
            name: true,
            gender: true,
            dob: true,
            isPrimary: true,
          },
        },
        sessions: {
          select: {
            id: true,
            device: true,
            ipAddress: true,
            lastActive: true,
            createdAt: true,
          },
          orderBy: { lastActive: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            sentRequests: true,
            receivedRequests: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      return createAdminResponse('User not found', 404);
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Admin get user error:', error);
    return createAdminResponse('Failed to fetch user', 500);
  }
}

// PATCH update user (suspend, verify, etc.)
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
    const { action, reason } = body;

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, name: true, isSuspended: true },
    });

    if (!user) {
      return createAdminResponse('User not found', 404);
    }

    let updatedUser;
    let auditAction: string;

    switch (action) {
      case 'suspend':
        updatedUser = await prisma.user.update({
          where: { id: params.id },
          data: {
            isSuspended: true,
            suspendedAt: new Date(),
            suspendedReason: reason || 'No reason provided',
          },
        });
        auditAction = AUDIT_ACTIONS.USER_SUSPENDED;
        break;

      case 'unsuspend':
        updatedUser = await prisma.user.update({
          where: { id: params.id },
          data: {
            isSuspended: false,
            suspendedAt: null,
            suspendedReason: null,
          },
        });
        auditAction = AUDIT_ACTIONS.USER_UNSUSPENDED;
        break;

      case 'verify':
        updatedUser = await prisma.user.update({
          where: { id: params.id },
          data: {
            verifiedAt: new Date(),
          },
        });
        auditAction = AUDIT_ACTIONS.USER_VERIFIED;
        break;

      case 'reset-password':
        // Generate OTP for password reset
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.oTPCode.create({
          data: {
            userId: params.id,
            email: user.email,
            code: otp,
            type: 'password_reset',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          },
        });
        updatedUser = user;
        auditAction = AUDIT_ACTIONS.USER_PASSWORD_RESET;
        break;

      default:
        return createAdminResponse('Invalid action', 400);
    }

    // Log admin action
    await createAuditLog({
      adminId: admin.id,
      action: auditAction,
      targetType: 'user',
      targetId: params.id,
      details: { reason, email: user.email, name: user.name },
      request,
    });

    return NextResponse.json(
      {
        message: `User ${action} successful`,
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin update user error:', error);
    return createAdminResponse('Failed to update user', 500);
  }
}

// DELETE user (super admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireSuperAdmin(request);
  if (!admin) {
    return createAdminResponse('Unauthorized. Super admin access required.', 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, name: true, isAdmin: true },
    });

    if (!user) {
      return createAdminResponse('User not found', 404);
    }

    // Prevent deleting admin users
    if (user.isAdmin) {
      return createAdminResponse('Cannot delete admin users', 403);
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: params.id },
    });

    // Log admin action
    await createAuditLog({
      adminId: admin.id,
      action: AUDIT_ACTIONS.USER_DELETED,
      targetType: 'user',
      targetId: params.id,
      details: { email: user.email, name: user.name },
      request,
    });

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin delete user error:', error);
    return createAdminResponse('Failed to delete user', 500);
  }
}
