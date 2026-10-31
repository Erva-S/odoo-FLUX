"use server";

import {
  getFinanceMetrics,
  getComprehensiveReports,
  formatReportsAsCSV,
  FinanceMetrics,
  ComprehensiveReportData,
} from "@/lib/services/analytics";

export async function fetchFinanceMetricsAction(): Promise<FinanceMetrics> {
  try {
    return await getFinanceMetrics();
  } catch (err: any) {
    console.error("fetchFinanceMetricsAction error:", err);
    return {
      totalCustomers: 0,
      activeSubscriptions: 0,
      totalBilled: 0,
      revenueCollected: 0,
      stillOwed: 0,
      overdueAmount: 0,
      overdueCount: 0,
      mrr: 0,
      arr: 0,
      quotationCount: 0,
      churnCount: 0,
    };
  }
}

export async function fetchComprehensiveReportsAction(): Promise<ComprehensiveReportData | null> {
  try {
    return await getComprehensiveReports();
  } catch (err: any) {
    console.error("fetchComprehensiveReportsAction error:", err);
    return null;
  }
}

export async function exportReportsCSVAction(): Promise<{ success: boolean; csv?: string; error?: string }> {
  try {
    const data = await getComprehensiveReports();
    if (!data) return { success: false, error: "Failed to generate report data." };
    const csv = formatReportsAsCSV(data);
    return { success: true, csv };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to generate CSV export." };
  }
}

