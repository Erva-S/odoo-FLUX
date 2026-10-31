export interface AdminDashboardData {
  system: {
    totalUsers: number;
    totalCustomers: number;
    totalStaff: number;
    databaseStatus: string;
    version: string;
  };
  isMockFinancialData: boolean;
  financialSummary: {
    mrr: {
      value: number;
      formatted: string;
      changePercent: number;
      period: string;
    };
    activeSubscriptions: {
      value: number;
      netAddition: number;
      churnRate: number;
      enterpriseCount: number;
      proStarterCount: number;
    };
    revenueCollected: {
      value: number;
      formatted: string;
      collectionRate: number;
    };
    outstandingPayments: {
      value: number;
      formatted: string;
      accountCount: number;
      inGracePeriod: number;
    };
    overdueInvoices: {
      value: number;
      formatted: string;
      invoiceCount: number;
      dunningStage: string;
    };
    dunningAlert: {
      overdueCount: number;
      amountAtRisk: string;
      headline: string;
      description: string;
    };
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    user: string;
    timestamp: string;
  }>;
}
