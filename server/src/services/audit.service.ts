import { prisma } from '../config/database.js';

export interface CreateAuditLogParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: any;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata ?? PrismaJsonNull(),
      },
    });
  } catch (err) {
    // Audit logging should not crash primary operations, but we log the error
    console.error('Failed to write audit log:', err);
    return null;
  }
}

function PrismaJsonNull(): any {
  return undefined;
}
