import { prisma } from '../config/database.js';
import { Role } from '../types/auth.js';

export async function getAdminDashboardMetrics() {
  const [totalUsers, totalCustomers, totalStaff] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.CUSTOMER } }),
    prisma.user.count({ where: { role: Role.STAFF } }),
  ]);

  const recentAuditLogs = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return {
    // Verified real database metrics for Phase 1
    system: {
      totalUsers,
      totalCustomers,
      totalStaff,
      databaseStatus: 'OPERATIONAL',
      version: 'Phase 1 - Foundation',
    },
    // Approved financial & subscription metrics (clearly identified mock data for Phase 1 as required)
    isMockFinancialData: true,
    financialSummary: {
      mrr: {
        value: 4865200,
        formatted: '₹48,65,200',
        changePercent: 14.2,
        period: 'vs last month',
      },
      activeSubscriptions: {
        value: 1428,
        netAddition: 84,
        churnRate: 0.8,
        enterpriseCount: 342,
        proStarterCount: 1086,
      },
      revenueCollected: {
        value: 4218900,
        formatted: '₹42,18,900',
        collectionRate: 91.4,
      },
      outstandingPayments: {
        value: 646300,
        formatted: '₹6,46,300',
        accountCount: 42,
        inGracePeriod: 461800,
      },
      overdueInvoices: {
        value: 184500,
        formatted: '₹1,84,500',
        invoiceCount: 12,
        dunningStage: 'Stage 3 Escalation',
      },
      dunningAlert: {
        overdueCount: 12,
        amountAtRisk: '₹1,84,500',
        headline: '12 Invoices Overdue for Collection',
        description: 'Automated retry threshold exceeded for 4 enterprise accounts. Action required to prevent service pause.',
      },
    },
    recentActivity: recentAuditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      user: log.user ? `${log.user.name} (${log.user.role})` : 'System',
      timestamp: log.createdAt,
    })),
  };
}

export async function listAllUsers(role?: Role) {
  return prisma.user.findMany({
    where: role ? { role } : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      customer: {
        select: {
          companyName: true,
          contactNumber: true,
          billingAddress: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
