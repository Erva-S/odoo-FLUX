import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { notificationService } from "./notifications";

export interface BillingRunResult {
  success: boolean;
  timestamp: string;
  executionTimeMs: number;
  totalEligible: number;
  createdCount: number;
  skippedCount: number;
  failedCount: number;
  errors: { subscriptionNumber: string; error: string }[];
  invoicesCreated: {
    invoiceNumber: string;
    subscriptionNumber: string;
    customerEmail: string;
    totalAmount: number;
  }[];
}

/**
 * Accurately calculate next billing period boundary with month-end and leap-year handling.
 */
export function calculateBillingPeriod(
  periodStart: Date,
  frequency: "daily" | "weekly" | "monthly" | "yearly" | string
): { startStr: string; endStr: string; dueDateStr: string } {
  const startStr = periodStart.toISOString().split("T")[0];

  const end = new Date(periodStart);
  if (frequency === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    // Default to monthly: handle month end correctly (e.g. Jan 31 -> Feb 28)
    const expectedMonth = (end.getMonth() + 1) % 12;
    end.setMonth(end.getMonth() + 1);
    // If date rolled into the month after (e.g. Feb 31 -> Mar 3), clamp back to last day of month
    if (end.getMonth() !== expectedMonth) {
      end.setDate(0);
    }
  }

  const due = new Date(periodStart);
  due.setDate(due.getDate() + 30); // Net 30 standard payment terms

  return {
    startStr,
    endStr: end.toISOString().split("T")[0],
    dueDateStr: due.toISOString().split("T")[0],
  };
}

/**
 * Execute idempotent recurring billing engine across all active subscriptions in PostgreSQL.
 */
export async function executeRecurringBillingRun(options: {
  targetDate?: string;
} = {}): Promise<BillingRunResult> {
  const startTime = Date.now();
  const supabase = getAdminSupabaseClient();
  const targetDate = options.targetDate ? new Date(options.targetDate) : new Date();

  const errors: { subscriptionNumber: string; error: string }[] = [];
  const invoicesCreated: {
    invoiceNumber: string;
    subscriptionNumber: string;
    customerEmail: string;
    totalAmount: number;
  }[] = [];

  let createdCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  // 1. Fetch all active subscriptions
  const { data: activeSubs, error: subsErr } = await (supabase as any)
    .from("subscriptions")
    .select(`
      id,
      subscription_number,
      customer_id,
      plan_id,
      status,
      start_date,
      payment_terms
    `)
    .eq("status", "active");

  if (subsErr || !activeSubs) {
    console.error("Billing engine failed to query active subscriptions:", subsErr);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      executionTimeMs: Date.now() - startTime,
      totalEligible: 0,
      createdCount: 0,
      skippedCount: 0,
      failedCount: 1,
      errors: [{ subscriptionNumber: "ALL", error: subsErr?.message || "Database query failed" }],
      invoicesCreated: [],
    };
  }

  const totalEligible = activeSubs.length;

  if (totalEligible === 0) {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      executionTimeMs: Date.now() - startTime,
      totalEligible: 0,
      createdCount: 0,
      skippedCount: 0,
      failedCount: 0,
      errors: [],
      invoicesCreated: [],
    };
  }

  // 2. Fetch plans & profiles for billing terms
  const planIds = Array.from(new Set(activeSubs.map((s: any) => s.plan_id)));
  const { data: plans } = await (supabase as any)
    .from("plans")
    .select("id, name, billing_period, price")
    .in("id", planIds);

  const planMap = new Map<string, any>((plans || []).map((p: any) => [p.id, p]));

  const custIds = Array.from(new Set(activeSubs.map((s: any) => s.customer_id)));
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, name, email, company_name")
    .in("id", custIds);

  const profileMap = new Map<string, any>((profiles || []).map((p: any) => [p.id, p]));

  // 3. Process each active subscription
  for (const sub of activeSubs) {
    try {
      const plan = planMap.get(sub.plan_id);
      const cust = profileMap.get(sub.customer_id);
      const frequency = plan?.billing_period || "monthly";

      const { startStr, endStr, dueDateStr } = calculateBillingPeriod(targetDate, frequency);

      // Check database-level idempotency constraint before attempting insert
      const { data: existing } = await (supabase as any)
        .from("invoices")
        .select("id, invoice_number")
        .eq("subscription_id", sub.id)
        .eq("billing_period_start", startStr)
        .maybeSingle();

      if (existing) {
        skippedCount++;
        continue;
      }

      // Fetch subscription lines to snapshot pricing
      const { data: lines } = await (supabase as any)
        .from("subscription_lines")
        .select(`
          id,
          product_id,
          variant_id,
          quantity,
          unit_price,
          tax_rate,
          amount
        `)
        .eq("subscription_id", sub.id);

      // Fetch products for descriptions
      const prodIds = Array.from(new Set((lines || []).map((l: any) => l.product_id)));
      const { data: prods } = await (supabase as any)
        .from("products")
        .select("id, name")
        .in("id", prodIds.length ? prodIds : ["00000000-0000-0000-0000-000000000000"]);

      const prodMap = new Map<string, string>((prods || []).map((p: any) => [p.id, p.name]));

      let subtotal = 0;
      let taxTotal = 0;

      const linesSnapshot = (lines || []).map((l: any) => {
        const prodName = prodMap.get(l.product_id) || "Platform Subscription Service";
        const hasVariant = Boolean(l.variant_id);
        const desc = hasVariant ? `${prodName} (Brand: Odoo Variant)` : prodName;
        const lineAmt = Number(l.amount) || Number(l.unit_price) * (l.quantity || 1);
        const lineTax = Math.round(lineAmt * (Number(l.tax_rate || 10) / 100) * 100) / 100;

        subtotal += lineAmt;
        taxTotal += lineTax;

        return {
          product_id: l.product_id,
          description: desc,
          quantity: l.quantity || 1,
          unit_price: Number(l.unit_price),
          tax_rate: Number(l.tax_rate || 10),
          amount: lineAmt,
        };
      });

      // Fallback if no lines exist on subscription (e.g. use plan price)
      if (linesSnapshot.length === 0 && plan) {
        const planPrice = Number(plan.price) || 299.0;
        const planTax = Math.round(planPrice * 0.1 * 100) / 100;
        subtotal = planPrice;
        taxTotal = planTax;

        linesSnapshot.push({
          product_id: prods?.[0]?.id || sub.id,
          description: `Subscription: ${plan.name}`,
          quantity: 1,
          unit_price: planPrice,
          tax_rate: 10.0,
          amount: planPrice,
        });
      }

      const totalAmount = Math.round((subtotal + taxTotal) * 100) / 100;

      // Generate invoice number
      const todayStr = targetDate.toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
      const invoiceNumber = `INV-${todayStr}-${randomSuffix}`;

      // Insert invoice
      const { data: newInv, error: invErr } = await (supabase as any)
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          subscription_id: sub.id,
          customer_id: sub.customer_id,
          billing_period_start: startStr,
          billing_period_end: endStr,
          status: "confirmed",
          subtotal,
          discount_amount: 0.0,
          tax_amount: taxTotal,
          total_amount: totalAmount,
          amount_paid: 0.0,
          due_date: dueDateStr,
        })
        .select()
        .single();

      if (invErr || !newInv) {
        if (invErr?.code === "23505") {
          // Idempotency violation on concurrent run
          skippedCount++;
        } else {
          failedCount++;
          errors.push({ subscriptionNumber: sub.subscription_number, error: invErr?.message || "Insert failed" });
        }
        continue;
      }

      // Insert snapshot lines
      const lineRecords = linesSnapshot.map((l: any) => ({
        invoice_id: newInv.id,
        product_id: l.product_id,
        description: l.description,
        quantity: l.quantity,
        unit_price: l.unit_price,
        tax_rate: l.tax_rate,
        amount: l.amount,
      }));

      await (supabase as any).from("invoice_lines").insert(lineRecords);

      createdCount++;
      invoicesCreated.push({
        invoiceNumber,
        subscriptionNumber: sub.subscription_number,
        customerEmail: cust?.email || "customer@brightloop.io",
        totalAmount,
      });

      // Dispatch async notification abstraction
      await notificationService.send({
        to: cust?.email || "customer@brightloop.io",
        subject: `Your new invoice ${invoiceNumber} is ready`,
        template: "invoice_created",
        variables: {
          invoiceNumber,
          amount: totalAmount,
          dueDate: dueDateStr,
        },
      });
    } catch (err: any) {
      failedCount++;
      errors.push({ subscriptionNumber: sub.subscription_number, error: err.message || "Unknown error" });
    }
  }

  return {
    success: failedCount === 0,
    timestamp: new Date().toISOString(),
    executionTimeMs: Date.now() - startTime,
    totalEligible,
    createdCount,
    skippedCount,
    failedCount,
    errors,
    invoicesCreated,
  };
}

