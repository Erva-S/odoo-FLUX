import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export interface FinanceMetrics {
  totalCustomers: number;
  activeSubscriptions: number;
  totalBilled: number;
  revenueCollected: number;
  stillOwed: number;
  overdueAmount: number;
  overdueCount: number;
  mrr: number;
  arr: number;
  quotationCount: number;
  churnCount: number;
}

export interface RevenueByMonthItem {
  month: string; // e.g. "2026-10"
  revenue: number;
  invoicesCount: number;
}

export interface RevenueByProductItem {
  productName: string;
  totalRevenue: number;
  quantitySold: number;
}

export interface RevenueByPlanItem {
  planName: string;
  activeContracts: number;
  estimatedMrr: number;
}

export interface PaymentMethodItem {
  method: string;
  totalAmount: number;
  transactionCount: number;
}

export interface ComprehensiveReportData {
  metrics: FinanceMetrics;
  revenueByMonth: RevenueByMonthItem[];
  revenueByProduct: RevenueByProductItem[];
  revenueByPlan: RevenueByPlanItem[];
  paymentMethods: PaymentMethodItem[];
}

/**
 * Fetch real-time FinOps and financial metrics from PostgreSQL.
 */
export async function getFinanceMetrics(asAdmin = false): Promise<FinanceMetrics> {
  const supabase = asAdmin ? getAdminSupabaseClient() : await createServerSupabaseClient();

  // 1. Invoices metrics
  const { data: invoices } = await (supabase as any)
    .from("invoices")
    .select("total_amount, amount_paid, status, due_date");

  const now = new Date();
  let totalBilled = 0;
  let revenueCollected = 0;
  let overdueAmount = 0;
  let overdueCount = 0;

  (invoices || []).forEach((inv: any) => {
    const tot = Number(inv.total_amount) || 0;
    const paid = Number(inv.amount_paid) || 0;
    totalBilled += tot;
    revenueCollected += paid;

    const remaining = Math.max(0, tot - paid);
    const isPastDue = new Date(inv.due_date) < now && inv.status !== "paid" && inv.status !== "cancelled";
    if (isPastDue && remaining > 0) {
      overdueAmount += remaining;
      overdueCount++;
    }
  });

  const stillOwed = Math.max(0, totalBilled - revenueCollected);

  // 2. Customers count
  const { count: customerCount } = await (supabase as any)
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "customer");

  // 3. Subscriptions & MRR / ARR
  const { data: subscriptions } = await (supabase as any)
    .from("subscriptions")
    .select(`
      id,
      status,
      plan_id,
      plans (
        billing_period,
        price
      ),
      subscription_lines (
        amount
      )
    `);

  let activeSubs = 0;
  let quotationCount = 0;
  let churnCount = 0;
  let mrr = 0;

  (subscriptions || []).forEach((sub: any) => {
    if (sub.status === "active") {
      activeSubs++;

      // Compute subscription subtotal
      let subTotal = 0;
      if (sub.subscription_lines && sub.subscription_lines.length > 0) {
        subTotal = sub.subscription_lines.reduce((acc: number, l: any) => acc + Number(l.amount || 0), 0);
      } else if (sub.plans) {
        subTotal = Number(sub.plans.price || 0);
      }

      const period = sub.plans?.billing_period || "monthly";
      if (period === "yearly") {
        mrr += subTotal / 12;
      } else {
        mrr += subTotal;
      }
    } else if (sub.status === "quotation" || sub.status === "draft") {
      quotationCount++;
    } else if (sub.status === "closed") {
      churnCount++;
    }
  });

  const roundedMrr = Math.round(mrr * 100) / 100;
  const roundedArr = Math.round(roundedMrr * 12 * 100) / 100;

  return {
    totalCustomers: customerCount || 0,
    activeSubscriptions: activeSubs,
    totalBilled: Math.round(totalBilled * 100) / 100,
    revenueCollected: Math.round(revenueCollected * 100) / 100,
    stillOwed: Math.round(stillOwed * 100) / 100,
    overdueAmount: Math.round(overdueAmount * 100) / 100,
    overdueCount,
    mrr: roundedMrr,
    arr: roundedArr,
    quotationCount,
    churnCount,
  };
}

/**
 * Fetch comprehensive reports aggregated across historical transactions in PostgreSQL.
 */
export async function getComprehensiveReports(asAdmin = false): Promise<ComprehensiveReportData> {
  const supabase = asAdmin ? getAdminSupabaseClient() : await createServerSupabaseClient();
  const metrics = await getFinanceMetrics(asAdmin);

  // 1. Revenue by Month (from payments)
  const { data: payments } = await (supabase as any)
    .from("payments")
    .select("amount, method, payment_date");

  const monthMap = new Map<string, { revenue: number; count: number }>();
  const methodMap = new Map<string, { total: number; count: number }>();

  (payments || []).forEach((p: any) => {
    const amt = Number(p.amount || 0);
    const m = (p.payment_date || "").slice(0, 7) || "2026-10";
    const curMonth = monthMap.get(m) || { revenue: 0, count: 0 };
    curMonth.revenue += amt;
    curMonth.count += 1;
    monthMap.set(m, curMonth);

    const meth = p.method || "other";
    const curMeth = methodMap.get(meth) || { total: 0, count: 0 };
    curMeth.total += amt;
    curMeth.count += 1;
    methodMap.set(meth, curMeth);
  });

  const revenueByMonth: RevenueByMonthItem[] = Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue * 100) / 100,
      invoicesCount: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const paymentMethods: PaymentMethodItem[] = Array.from(methodMap.entries()).map(([method, data]) => ({
    method,
    totalAmount: Math.round(data.total * 100) / 100,
    transactionCount: data.count,
  }));

  // 2. Revenue by Product (from invoice_lines)
  const { data: invoiceLines } = await (supabase as any)
    .from("invoice_lines")
    .select("description, amount, quantity");

  const prodMap = new Map<string, { total: number; qty: number }>();
  (invoiceLines || []).forEach((l: any) => {
    const name = l.description?.split("(")[0]?.trim() || "Platform Core";
    const cur = prodMap.get(name) || { total: 0, qty: 0 };
    cur.total += Number(l.amount || 0);
    cur.qty += Number(l.quantity || 1);
    prodMap.set(name, cur);
  });

  const revenueByProduct: RevenueByProductItem[] = Array.from(prodMap.entries()).map(([productName, data]) => ({
    productName,
    totalRevenue: Math.round(data.total * 100) / 100,
    quantitySold: data.qty,
  }));

  // 3. Revenue by Plan
  const { data: plans } = await (supabase as any).from("plans").select("id, name, billing_period, price");
  const { data: subs } = await (supabase as any).from("subscriptions").select("plan_id, status");

  const planSubCounts = new Map<string, number>();
  (subs || []).forEach((s: any) => {
    if (s.status === "active") {
      planSubCounts.set(s.plan_id, (planSubCounts.get(s.plan_id) || 0) + 1);
    }
  });

  const revenueByPlan: RevenueByPlanItem[] = (plans || []).map((pl: any) => {
    const count = planSubCounts.get(pl.id) || 0;
    const price = Number(pl.price || 0);
    const mrrFactor = pl.billing_period === "yearly" ? 1 / 12 : 1;
    return {
      planName: pl.name,
      activeContracts: count,
      estimatedMrr: Math.round(count * price * mrrFactor * 100) / 100,
    };
  });

  return {
    metrics,
    revenueByMonth,
    revenueByProduct,
    revenueByPlan,
    paymentMethods,
  };
}

/**
 * Generate CSV string for export of reports.
 */
export function formatReportsAsCSV(reportData: ComprehensiveReportData): string {
  const lines: string[] = [];

  lines.push("BRIGHTLOOP BILLING — FINANCIAL ANALYTICS REPORT");
  lines.push(`Generated At,${new Date().toISOString()}`);
  lines.push("");

  lines.push("KEY PERFORMANCE METRICS");
  lines.push("Metric,Value");
  lines.push(`Total Revenue Collected,$${reportData.metrics.revenueCollected.toFixed(2)}`);
  lines.push(`Total Outstanding Receivables,$${reportData.metrics.stillOwed.toFixed(2)}`);
  lines.push(`Overdue Balance,$${reportData.metrics.overdueAmount.toFixed(2)} (${reportData.metrics.overdueCount} invoices)`);
  lines.push(`Monthly Recurring Revenue (MRR),$${reportData.metrics.mrr.toFixed(2)}`);
  lines.push(`Annual Recurring Revenue (ARR),$${reportData.metrics.arr.toFixed(2)}`);
  lines.push(`Active Subscriptions,${reportData.metrics.activeSubscriptions}`);
  lines.push(`Total Customers,${reportData.metrics.totalCustomers}`);
  lines.push("");

  lines.push("REVENUE BY MONTH");
  lines.push("Month,Settled Revenue,Transactions Count");
  reportData.revenueByMonth.forEach((m) => {
    lines.push(`${m.month},$${m.revenue.toFixed(2)},${m.invoicesCount}`);
  });
  lines.push("");

  lines.push("REVENUE BY PRODUCT");
  lines.push("Product Name,Total Invoiced,Units Invoiced");
  reportData.revenueByProduct.forEach((p) => {
    lines.push(`"${p.productName}",$${p.totalRevenue.toFixed(2)},${p.quantitySold}`);
  });
  lines.push("");

  lines.push("PAYMENT METHODS BREAKDOWN");
  lines.push("Method,Volume Settled,Transaction Count");
  reportData.paymentMethods.forEach((pm) => {
    lines.push(`${pm.method.toUpperCase()},$${pm.totalAmount.toFixed(2)},${pm.transactionCount}`);
  });

  return lines.join("\n");
}
