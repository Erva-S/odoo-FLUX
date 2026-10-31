import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { Invoice, InvoiceLine } from "@/lib/data/types";

export interface InvoiceQueryParams {
  status?: string;
  search?: string;
  customerId?: string;
  subscriptionId?: string;
  page?: number;
  pageSize?: number;
  asAdmin?: boolean;
}

export interface InvoicesResult {
  invoices: Invoice[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ProfileRow {
  id: string;
  name: string | null;
  email: string;
  company_name: string | null;
  billing_address: string | null;
  phone: string | null;
}

interface SubscriptionRow {
  id: string;
  subscription_number: string;
  payment_terms?: string | null;
}

interface InvoiceLineRow {
  id: string;
  invoice_id: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number | string;
  tax_rate: number | string;
  amount: number | string;
}

interface InvoiceRow {
  id: string;
  invoice_number: string;
  subscription_id: string;
  customer_id: string;
  billing_period_start: string;
  billing_period_end: string;
  status: "draft" | "confirmed" | "paid" | "cancelled";
  subtotal: number | string;
  discount_amount: number | string;
  tax_amount: number | string;
  total_amount: number | string;
  amount_paid: number | string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch a paginated and filtered list of invoices from PostgreSQL.
 */
export async function getInvoices(params: InvoiceQueryParams = {}): Promise<InvoicesResult> {
  const {
    status = "all",
    search = "",
    customerId,
    subscriptionId,
    page = 1,
    pageSize = 15,
    asAdmin = false,
  } = params;

  const supabase = asAdmin ? getAdminSupabaseClient() : await createServerSupabaseClient();

  let query = (supabase as any)
    .from("invoices")
    .select(
      `
      id,
      invoice_number,
      subscription_id,
      customer_id,
      billing_period_start,
      billing_period_end,
      status,
      subtotal,
      discount_amount,
      tax_amount,
      total_amount,
      amount_paid,
      due_date,
      created_at,
      updated_at
    `,
      { count: "exact" }
    );

  if (customerId) {
    query = query.eq("customer_id", customerId);
  }

  if (subscriptionId) {
    query = query.eq("subscription_id", subscriptionId);
  }

  // Status filtering (handling 'overdue' special state)
  const nowStr = new Date().toISOString().split("T")[0];
  if (status === "overdue") {
    query = query.eq("status", "confirmed").lt("due_date", nowStr);
  } else if (status !== "all") {
    query = query.eq("status", status.toLowerCase());
  }

  query = query.order("created_at", { ascending: false });

  // Pagination bounds
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: rawInvoices, count, error } = await query;

  if (error || !rawInvoices) {
    console.error("Error fetching invoices:", error);
    return {
      invoices: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }

  const invoiceRows = rawInvoices as InvoiceRow[];

  if (invoiceRows.length === 0) {
    return {
      invoices: [],
      totalCount: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize) || 1,
    };
  }

  // Resolve customer profiles
  const custIds = Array.from(new Set(invoiceRows.map((i: InvoiceRow) => i.customer_id)));
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, name, email, company_name, billing_address, phone")
    .in("id", custIds);

  const profileMap = new Map<string, ProfileRow>(
    ((profiles as ProfileRow[]) || []).map((p: ProfileRow) => [p.id, p])
  );

  // Resolve subscriptions
  const subIds = Array.from(new Set(invoiceRows.map((i: InvoiceRow) => i.subscription_id)));
  const { data: subs } = await (supabase as any)
    .from("subscriptions")
    .select("id, subscription_number")
    .in("id", subIds);

  const subMap = new Map<string, string>(
    ((subs as SubscriptionRow[]) || []).map((s: SubscriptionRow) => [s.id, s.subscription_number])
  );

  // Resolve invoice lines
  const invIds = invoiceRows.map((i: InvoiceRow) => i.id);
  const { data: rawLines } = await (supabase as any)
    .from("invoice_lines")
    .select("id, invoice_id, product_id, description, quantity, unit_price, tax_rate, amount")
    .in("invoice_id", invIds);

  const linesMap = new Map<string, InvoiceLine[]>();
  (((rawLines as InvoiceLineRow[]) || [])).forEach((l: InvoiceLineRow) => {
    const list = linesMap.get(l.invoice_id) || [];
    list.push({
      id: l.id,
      productId: l.product_id,
      description: l.description,
      quantity: l.quantity,
      unitPrice: Number(l.unit_price),
      taxRate: Number(l.tax_rate),
      amount: Number(l.amount),
    });
    linesMap.set(l.invoice_id, list);
  });

  const now = new Date();

  // Map to frontend Invoice interface
  let formatted: Invoice[] = invoiceRows.map((inv: InvoiceRow) => {
    const cust = profileMap.get(inv.customer_id);
    const subNum = subMap.get(inv.subscription_id) || "N/A";
    const isOverdue =
      inv.status === "confirmed" && new Date(inv.due_date) < now && Number(inv.amount_paid) < Number(inv.total_amount);

    return {
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      subscriptionId: inv.subscription_id,
      subscriptionNumber: subNum,
      customerId: inv.customer_id,
      customerName: cust?.company_name || cust?.name || "Customer",
      customerEmail: cust?.email || "",
      customerCompany: cust?.company_name || undefined,
      customerAddress: cust?.billing_address || undefined,
      billingPeriodStart: inv.billing_period_start,
      billingPeriodEnd: inv.billing_period_end,
      status: inv.status,
      subtotal: Number(inv.subtotal),
      discountAmount: Number(inv.discount_amount),
      taxAmount: Number(inv.tax_amount),
      totalAmount: Number(inv.total_amount),
      amountPaid: Number(inv.amount_paid),
      dueDate: inv.due_date,
      isOverdue,
      lines: linesMap.get(inv.id) || [],
      createdAt: inv.created_at,
      updatedAt: inv.updated_at,
    };
  });

  // Client search filtering if search term provided
  if (search.trim()) {
    const s = search.toLowerCase();
    formatted = formatted.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(s) ||
        inv.customerName.toLowerCase().includes(s) ||
        inv.subscriptionNumber.toLowerCase().includes(s) ||
        inv.customerEmail.toLowerCase().includes(s)
    );
  }

  const total = count || formatted.length;

  return {
    invoices: formatted,
    totalCount: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

/**
 * Fetch single invoice by ID or Invoice Number with complete relations.
 */
export async function getInvoiceById(idOrNumber: string, asAdmin = false): Promise<Invoice | null> {
  const supabase = asAdmin ? getAdminSupabaseClient() : await createServerSupabaseClient();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);

  let query = (supabase as any).from("invoices").select("*");
  if (isUuid) {
    query = query.eq("id", idOrNumber);
  } else {
    query = query.eq("invoice_number", idOrNumber);
  }

  const { data: inv, error } = await query.maybeSingle();

  if (error || !inv) {
    return null;
  }

  const invRow = inv as InvoiceRow;

  // Profile details
  const { data: cust } = await (supabase as any)
    .from("profiles")
    .select("id, name, email, company_name, billing_address, phone")
    .eq("id", invRow.customer_id)
    .maybeSingle();

  const custRow = cust as ProfileRow | null;

  // Subscription details
  const { data: sub } = await (supabase as any)
    .from("subscriptions")
    .select("id, subscription_number, payment_terms")
    .eq("id", invRow.subscription_id)
    .maybeSingle();

  const subRow = sub as SubscriptionRow | null;

  // Invoice lines
  const { data: rawLines } = await (supabase as any)
    .from("invoice_lines")
    .select("id, product_id, description, quantity, unit_price, tax_rate, amount")
    .eq("invoice_id", invRow.id);

  const lines: InvoiceLine[] = (((rawLines as InvoiceLineRow[]) || [])).map((l: InvoiceLineRow) => ({
    id: l.id,
    productId: l.product_id,
    description: l.description,
    quantity: l.quantity,
    unitPrice: Number(l.unit_price),
    taxRate: Number(l.tax_rate),
    amount: Number(l.amount),
  }));

  const now = new Date();
  const isOverdue =
    invRow.status === "confirmed" && new Date(invRow.due_date) < now && Number(invRow.amount_paid) < Number(invRow.total_amount);

  return {
    id: invRow.id,
    invoiceNumber: invRow.invoice_number,
    subscriptionId: invRow.subscription_id,
    subscriptionNumber: subRow?.subscription_number || "N/A",
    customerId: invRow.customer_id,
    customerName: custRow?.company_name || custRow?.name || "Customer",
    customerEmail: custRow?.email || "",
    customerCompany: custRow?.company_name || undefined,
    customerAddress: custRow?.billing_address || undefined,
    billingPeriodStart: invRow.billing_period_start,
    billingPeriodEnd: invRow.billing_period_end,
    status: invRow.status,
    subtotal: Number(invRow.subtotal),
    discountAmount: Number(invRow.discount_amount),
    taxAmount: Number(invRow.tax_amount),
    totalAmount: Number(invRow.total_amount),
    amountPaid: Number(invRow.amount_paid),
    dueDate: invRow.due_date,
    isOverdue,
    lines,
    createdAt: invRow.created_at,
    updatedAt: invRow.updated_at,
  };
}

/**
 * Validated invoice status transition.
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  newStatus: "draft" | "confirmed" | "paid" | "cancelled",
  asAdmin = false
): Promise<{ success: boolean; error?: string; invoice?: Invoice }> {
  const supabase = asAdmin ? getAdminSupabaseClient() : await createServerSupabaseClient();

  // Fetch current status
  const current = await getInvoiceById(invoiceId, asAdmin);
  if (!current) {
    return { success: false, error: "Invoice not found" };
  }

  // Validate transitions
  if (current.status === "paid" && newStatus !== "paid") {
    return { success: false, error: "Cannot change status of a paid invoice directly. Use refund/credit." };
  }

  if (newStatus === "paid" && current.amountPaid < current.totalAmount) {
    return { success: false, error: "Cannot mark invoice as Paid without recording full payment settlement." };
  }

  if (current.status === "cancelled" && newStatus !== "cancelled") {
    return { success: false, error: "Cancelled invoices cannot be reopened." };
  }

  const { error: updateErr } = await (supabase as any)
    .from("invoices")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", current.id);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  const updated = await getInvoiceById(current.id, asAdmin);
  return { success: true, invoice: updated || undefined };
}

/**
 * Idempotent invoice creation with snapshot lines.
 */
export async function createInvoice(
  params: {
    subscriptionId: string;
    customerId: string;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    dueDate?: string;
    status?: "draft" | "confirmed";
    lines: {
      productId: string;
      description: string;
      quantity: number;
      unitPrice: number;
      taxRate?: number;
    }[];
  },
  asAdmin = false
): Promise<{ success: boolean; error?: string; invoice?: Invoice }> {
  const supabase = asAdmin ? getAdminSupabaseClient() : await createServerSupabaseClient();

  // Guard against duplicate billing for subscription and period
  const { data: existing } = await (supabase as any)
    .from("invoices")
    .select("id, invoice_number")
    .eq("subscription_id", params.subscriptionId)
    .eq("billing_period_start", params.billingPeriodStart)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: `Invoice already exists for this billing period (${existing.invoice_number}).`,
    };
  }

  // Calculate totals
  let subtotal = 0;
  let taxTotal = 0;

  const linesToInsert = params.lines.map((l) => {
    const lineAmount = Math.round(l.unitPrice * l.quantity * 100) / 100;
    const taxRate = l.taxRate ?? 10.0;
    const lineTax = Math.round(lineAmount * (taxRate / 100) * 100) / 100;
    subtotal += lineAmount;
    taxTotal += lineTax;

    return {
      productId: l.productId,
      description: l.description,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxRate,
      amount: lineAmount,
    };
  });

  const totalAmount = Math.round((subtotal + taxTotal) * 100) / 100;
  const dueDate =
    params.dueDate ||
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  // Generate unique invoice number: INV-YYYYMMDD-XXXX
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  const invoiceNumber = `INV-${todayStr}-${randomSuffix}`;

  const { data: newInv, error: invErr } = await (supabase as any)
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      subscription_id: params.subscriptionId,
      customer_id: params.customerId,
      billing_period_start: params.billingPeriodStart,
      billing_period_end: params.billingPeriodEnd,
      status: params.status || "confirmed",
      subtotal,
      discount_amount: 0.0,
      tax_amount: taxTotal,
      total_amount: totalAmount,
      amount_paid: 0.0,
      due_date: dueDate,
    })
    .select()
    .single();

  if (invErr || !newInv) {
    return { success: false, error: invErr?.message || "Failed to create invoice record." };
  }

  // Insert lines
  const lineRecords = linesToInsert.map((l) => ({
    invoice_id: newInv.id,
    product_id: l.productId,
    description: l.description,
    quantity: l.quantity,
    unit_price: l.unitPrice,
    tax_rate: l.taxRate,
    amount: l.amount,
  }));

  const { error: lineErr } = await (supabase as any).from("invoice_lines").insert(lineRecords);

  if (lineErr) {
    console.error("Line item insertion error:", lineErr);
  }

  const created = await getInvoiceById(newInv.id, asAdmin);
  return { success: true, invoice: created || undefined };
}
