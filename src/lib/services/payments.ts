import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { Payment } from "@/lib/data/types";
import { getInvoiceById } from "./invoices";

export interface PaymentQueryParams {
  invoiceId?: string;
  customerId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  asAdmin?: boolean;
}

export interface PaymentsResult {
  payments: Payment[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface PaymentRow {
  id: string;
  invoice_id: string;
  customer_id: string;
  amount: number | string;
  method: string;
  payment_date: string;
  note?: string | null;
  created_at: string;
}

interface ProfileSummary {
  id: string;
  name: string | null;
  company_name: string | null;
}

interface InvoiceSummary {
  id: string;
  invoice_number: string;
}

/**
 * Fetch paginated and filtered payments ledger from PostgreSQL.
 */
export async function getPayments(params: PaymentQueryParams = {}): Promise<PaymentsResult> {
  const {
    invoiceId,
    customerId,
    search = "",
    page = 1,
    pageSize = 15,
    asAdmin = false,
  } = params;

  const supabase = asAdmin ? getAdminSupabaseClient() : await createServerSupabaseClient();

  let query = (supabase as any)
    .from("payments")
    .select(
      `
      id,
      invoice_id,
      customer_id,
      amount,
      method,
      payment_date,
      note,
      created_at
    `,
      { count: "exact" }
    );

  if (invoiceId) {
    query = query.eq("invoice_id", invoiceId);
  }

  if (customerId) {
    query = query.eq("customer_id", customerId);
  }

  query = query.order("created_at", { ascending: false });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: rawPayments, count, error } = await query;

  if (error || !rawPayments) {
    console.error("Error fetching payments:", error);
    return {
      payments: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }

  const paymentRows = rawPayments as PaymentRow[];

  if (paymentRows.length === 0) {
    return {
      payments: [],
      totalCount: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1,
    };
  }

  // Resolve invoices
  const invIds = Array.from(new Set(paymentRows.map((p: PaymentRow) => p.invoice_id)));
  const { data: invoices } = await (supabase as any)
    .from("invoices")
    .select("id, invoice_number")
    .in("id", invIds);

  const invMap = new Map<string, string>(
    ((invoices as InvoiceSummary[]) || []).map((i: InvoiceSummary) => [i.id, i.invoice_number])
  );

  // Resolve customer profiles
  const custIds = Array.from(new Set(paymentRows.map((p: PaymentRow) => p.customer_id)));
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, name, company_name")
    .in("id", custIds);

  const profileMap = new Map<string, ProfileSummary>(
    ((profiles as ProfileSummary[]) || []).map((p: ProfileSummary) => [p.id, p])
  );

  let formatted: Payment[] = paymentRows.map((p: PaymentRow) => {
    const cust = profileMap.get(p.customer_id);
    return {
      id: p.id,
      invoiceId: p.invoice_id,
      invoiceNumber: invMap.get(p.invoice_id) || "N/A",
      customerId: p.customer_id,
      customerName: cust?.company_name || cust?.name || "Customer",
      amount: Number(p.amount),
      method: p.method as Payment["method"],
      paymentDate: p.payment_date,
      note: p.note || undefined,
      createdAt: p.created_at,
    };
  });

  if (search.trim()) {
    const s = search.toLowerCase();
    formatted = formatted.filter(
      (p) =>
        p.invoiceNumber.toLowerCase().includes(s) ||
        p.customerName.toLowerCase().includes(s) ||
        p.method.toLowerCase().includes(s) ||
        (p.note && p.note.toLowerCase().includes(s))
    );
  }

  const total = count || formatted.length;

  return {
    payments: formatted,
    totalCount: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

/**
 * Record an atomic payment against an invoice and update balance/status in PostgreSQL.
 */
export async function recordPayment(
  params: {
    invoiceId: string;
    amount: number;
    method: Payment["method"];
    note?: string;
    paymentDate?: string;
  },
  asAdmin = false
): Promise<{ success: boolean; error?: string; payment?: Payment }> {
  const supabase = asAdmin ? getAdminSupabaseClient() : await createServerSupabaseClient();

  const invoice = await getInvoiceById(params.invoiceId, asAdmin);
  if (!invoice) {
    return { success: false, error: "Target invoice not found." };
  }

  if (invoice.status === "cancelled") {
    return { success: false, error: "Cannot record payment on a cancelled invoice." };
  }

  const remaining = Math.round((invoice.totalAmount - invoice.amountPaid) * 100) / 100;
  if (remaining <= 0) {
    return { success: false, error: "This invoice is already fully paid." };
  }

  const payAmount = Math.round(params.amount * 100) / 100;
  if (payAmount <= 0) {
    return { success: false, error: "Payment amount must be greater than zero." };
  }

  if (payAmount > remaining + 0.01) {
    return {
      success: false,
      error: `Payment amount ($${payAmount.toFixed(2)}) exceeds remaining balance ($${remaining.toFixed(2)}).`,
    };
  }

  const newAmountPaid = Math.round((invoice.amountPaid + payAmount) * 100) / 100;
  const isFullyPaid = newAmountPaid >= invoice.totalAmount - 0.01;
  const newStatus = isFullyPaid ? "paid" : invoice.status;

  // 1. Insert Payment entry
  const payDate = params.paymentDate || new Date().toISOString().split("T")[0];
  const { data: newPay, error: payErr } = await (supabase as any)
    .from("payments")
    .insert({
      invoice_id: invoice.id,
      customer_id: invoice.customerId,
      amount: payAmount,
      method: params.method,
      payment_date: payDate,
      note: params.note || (isFullyPaid ? "Full settlement" : "Partial installment"),
    })
    .select()
    .single();

  if (payErr || !newPay) {
    return { success: false, error: payErr?.message || "Failed to log payment transaction." };
  }

  // 2. Update Invoice balance and status
  const { error: invUpdateErr } = await (supabase as any)
    .from("invoices")
    .update({
      amount_paid: newAmountPaid,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoice.id);

  if (invUpdateErr) {
    console.error("Warning: Invoice balance update error:", invUpdateErr);
  }

  return {
    success: true,
    payment: {
      id: newPay.id,
      invoiceId: newPay.invoice_id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: newPay.customer_id,
      customerName: invoice.customerName,
      amount: Number(newPay.amount),
      method: newPay.method as Payment["method"],
      paymentDate: newPay.payment_date,
      note: newPay.note || undefined,
      createdAt: newPay.created_at,
    },
  };
}
