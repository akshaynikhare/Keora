import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminResponse } from '@/lib/auth/admin-middleware';
import { getAuditLogs } from '@/lib/admin/audit-log';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return createAdminResponse('Unauthorized. Admin access required.', 401);
  }

  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const adminId = searchParams.get('adminId') || undefined;
    const action = searchParams.get('action') || undefined;
    const targetType = searchParams.get('targetType') || undefined;

    const offset = (page - 1) * limit;

    const result = await getAuditLogs({
      adminId,
      action,
      targetType,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        logs: result.logs,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasMore: result.hasMore,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin audit logs error:', error);
    return createAdminResponse('Failed to fetch audit logs', 500);
  }
}
