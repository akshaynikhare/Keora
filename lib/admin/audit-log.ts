import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

interface AuditLogData {
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, any>;
  request?: NextRequest;
}

/**
 * Create an audit log entry for admin actions
 */
export async function createAuditLog({
  adminId,
  action,
  targetType,
  targetId,
  details,
  request,
}: AuditLogData) {
  try {
    // Extract IP address from request
    let ipAddress: string | undefined;
    if (request) {
      ipAddress =
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        undefined;
    }

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details: details ? JSON.stringify(details) : undefined,
        ipAddress,
      },
    });

    console.log(`[AUDIT] ${action} by admin ${adminId}`, {
      targetType,
      targetId,
      ipAddress,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging failure shouldn't break the operation
  }
}

/**
 * Get audit logs with optional filters
 */
export async function getAuditLogs({
  adminId,
  action,
  targetType,
  limit = 50,
  offset = 0,
}: {
  adminId?: string;
  action?: string;
  targetType?: string;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};

  if (adminId) where.adminId = adminId;
  if (action) where.action = action;
  if (targetType) where.targetType = targetType;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            adminRole: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs: logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    })),
    total,
    hasMore: offset + limit < total,
  };
}

/**
 * Predefined audit actions
 */
export const AUDIT_ACTIONS = {
  // User management
  USER_SUSPENDED: 'user_suspended',
  USER_UNSUSPENDED: 'user_unsuspended',
  USER_DELETED: 'user_deleted',
  USER_PASSWORD_RESET: 'user_password_reset',
  USER_VERIFIED: 'user_verified',
  USER_ROLE_CHANGED: 'user_role_changed',

  // Content moderation
  CONTENT_FLAGGED: 'content_flagged',
  CONTENT_APPROVED: 'content_approved',
  CONTENT_REMOVED: 'content_removed',
  USER_WARNED: 'user_warned',
  USER_BANNED: 'user_banned',

  // System settings
  SETTINGS_UPDATED: 'settings_updated',
  FEATURE_FLAG_CHANGED: 'feature_flag_changed',
  RATE_LIMIT_CHANGED: 'rate_limit_changed',

  // Admin management
  ADMIN_CREATED: 'admin_created',
  ADMIN_REMOVED: 'admin_removed',
  ADMIN_ROLE_CHANGED: 'admin_role_changed',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
