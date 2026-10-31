import { createAdminClient } from "@/lib/supabase/admin";
import { Subscription, SubscriptionStatus, SubscriptionLine } from "@/lib/data/types";

export interface SubscriptionLineInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CreateSubscriptionInput {
  customerId: string;
  planId: string;
  paymentTerms?: string;
  discountId?: string;
  startDate?: string;
  expiryDate?: string;
  lines: SubscriptionLineInput[];
}

export interface SubscriptionListParams {
  search?: string;
  status?: string;
  customerId?: string;
  page?: number;
  pageSize?: number;
}

export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const ALLOWED_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  draft: ["quotation", "closed"],
  quotation: ["confirmed", "closed"],
  confirmed: ["active", "closed"],
  active: ["closed"],
  closed: ["draft"],
};

/**
 * Fetch subscriptions with pagination, filtering, customer details, and line items.
 */
export async function getSubscriptionsService(
  params: SubscriptionListParams = {}
): Promise<ServiceResult<{ subscriptions: Subscription[]; total: number; page: number; totalPages: number }>> {
  try {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 15);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = createAdminClient();

    let query = supabase
      .from("subscriptions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (params.customerId) {
      query = query.eq("customer_id", params.customerId);
    }

    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status as any);
    }

    if (params.search) {
      const q = params.search.trim();
      query = query.ilike("subscription_number", `%${q}%`);
    }

    query = query.range(from, to);

    const { data: subsData, count, error: subError } = await query;

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return { success: false, error: subError.message };
    }

    const subIds = (subsData || []).map((s) => s.id);
    const customerIds = Array.from(new Set((subsData || []).map((s) => s.customer_id)));
    const planIds = Array.from(new Set((subsData || []).map((s) => s.plan_id)));

    // 1. Fetch customer profiles
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, name, email, company_name")
      .in("id", customerIds.length > 0 ? customerIds : ["none"]);

    const profilesMap = new Map((profilesData || []).map((p) => [p.id, p]));

    // 2. Fetch plans
    const { data: plansData } = await supabase
      .from("plans")
      .select("id, name, price, billing_period")
      .in("id", planIds.length > 0 ? planIds : ["none"]);

    const plansMap = new Map((plansData || []).map((pl) => [pl.id, pl]));

    // 3. Fetch lines
    const { data: linesData } = await supabase
      .from("subscription_lines")
      .select("*")
      .in("subscription_id", subIds.length > 0 ? subIds : ["none"]);

    const linesBySub = new Map<string, any[]>();
    for (const l of linesData || []) {
      if (!linesBySub.has(l.subscription_id)) linesBySub.set(l.subscription_id, []);
      linesBySub.get(l.subscription_id)!.push(l);
    }

    const subscriptions: Subscription[] = (subsData || []).map((s) => {
      const cust = profilesMap.get(s.customer_id);
      const plan = plansMap.get(s.plan_id);
      const rawLines = linesBySub.get(s.id) || [];

      let subtotal = 0;
      const lines: SubscriptionLine[] = rawLines.map((l) => {
        const amt = Number(l.amount);
        subtotal += amt;
        return {
          id: l.id,
          subscriptionId: s.id,
          productId: l.product_id,
          variantId: l.variant_id || undefined,
          quantity: l.quantity,
          unitPrice: Number(l.unit_price),
          taxRate: Number(l.tax_rate),
          amount: amt,
        };
      });

      const taxAmount = Math.round(subtotal * 0.1 * 100) / 100;
      const totalAmount = subtotal + taxAmount;

      return {
        id: s.id,
        subscriptionNumber: s.subscription_number,
        customerId: s.customer_id,
        customerName: cust?.company_name || cust?.name || "Customer",
        customerEmail: cust?.email || "",
        planId: s.plan_id,
        planName: plan?.name || "Subscription Plan",
        status: s.status as SubscriptionStatus,
        startDate: s.start_date,
        expiryDate: s.expiry_date || undefined,
        paymentTerms: s.payment_terms,
        subtotal,
        discountAmount: 0,
        taxAmount,
        totalAmount,
        lines,
        createdAt: s.created_at,
        updatedAt: s.updated_at || s.created_at,
      };
    });

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      success: true,
      data: {
        subscriptions,
        total,
        page,
        totalPages,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load subscriptions.";
    return { success: false, error: msg };
  }
}

/**
 * Fetch a single subscription by ID with full lines, customer, and plan.
 */
export async function getSubscriptionByIdService(id: string): Promise<ServiceResult<Subscription>> {
  try {
    if (!id) return { success: false, error: "Subscription ID is required." };

    const supabase = createAdminClient();

    const { data: s, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !s) {
      return { success: false, error: error?.message || "Subscription not found." };
    }

    // Fetch related profile
    const { data: cust } = await supabase
      .from("profiles")
      .select("id, name, email, company_name")
      .eq("id", s.customer_id)
      .maybeSingle();

    // Fetch related plan
    const { data: plan } = await supabase
      .from("plans")
      .select("id, name, price, billing_period")
      .eq("id", s.plan_id)
      .maybeSingle();

    // Fetch related lines
    const { data: rawLines } = await supabase
      .from("subscription_lines")
      .select("*")
      .eq("subscription_id", s.id);

    let subtotal = 0;
    const lines: SubscriptionLine[] = (rawLines || []).map((l) => {
      const amt = Number(l.amount);
      subtotal += amt;
      return {
        id: l.id,
        subscriptionId: s.id,
        productId: l.product_id,
        variantId: l.variant_id || undefined,
        quantity: l.quantity,
        unitPrice: Number(l.unit_price),
        taxRate: Number(l.tax_rate),
        amount: amt,
      };
    });

    const taxAmount = Math.round(subtotal * 0.1 * 100) / 100;
    const totalAmount = subtotal + taxAmount;

    return {
      success: true,
      data: {
        id: s.id,
        subscriptionNumber: s.subscription_number,
        customerId: s.customer_id,
        customerName: cust?.company_name || cust?.name || "Customer",
        customerEmail: cust?.email || "",
        planId: s.plan_id,
        planName: plan?.name || "Subscription Plan",
        status: s.status as SubscriptionStatus,
        startDate: s.start_date,
        expiryDate: s.expiry_date || undefined,
        paymentTerms: s.payment_terms,
        subtotal,
        discountAmount: 0,
        taxAmount,
        totalAmount,
        lines,
        createdAt: s.created_at,
        updatedAt: s.updated_at || s.created_at,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load subscription.";
    return { success: false, error: msg };
  }
}

/**
 * Creates a subscription and its lines in PostgreSQL.
 */
export async function createSubscriptionService(
  input: CreateSubscriptionInput
): Promise<ServiceResult<Subscription>> {
  try {
    if (!input.customerId || !input.planId || !input.lines?.length) {
      return { success: false, error: "Customer, plan, and at least one line item are required." };
    }

    const supabase = createAdminClient();

    // 1. Fetch products & variants to compute accurate pricing
    const { data: prods } = await supabase.from("products").select("*");
    const { data: variants } = await supabase.from("product_variants").select("*");
    const { data: plan } = await supabase.from("plans").select("*").eq("id", input.planId).single();

    if (!plan) {
      return { success: false, error: "Selected plan does not exist." };
    }

    // 2. Generate subscription number e.g. SUB-0041
    const { count } = await supabase.from("subscriptions").select("id", { count: "exact", head: true });
    const nextNum = (count || 0) + 1;
    const subNumber = `SUB-${String(nextNum).padStart(4, "0")}`;

    const startDate = input.startDate || new Date().toISOString().split("T")[0];
    const startDateObj = new Date(startDate);
    const expiryDateObj = new Date(startDateObj);
    if (plan.billing_period === "yearly") {
      expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1);
    } else {
      expiryDateObj.setMonth(expiryDateObj.getMonth() + 1);
    }
    const expiryDate = input.expiryDate || expiryDateObj.toISOString().split("T")[0];

    // 3. Insert subscription record
    const { data: newSub, error: subErr } = await supabase
      .from("subscriptions")
      .insert({
        subscription_number: subNumber,
        customer_id: input.customerId,
        plan_id: input.planId,
        status: "draft",
        start_date: startDate,
        expiry_date: expiryDate,
        payment_terms: input.paymentTerms || "Net 30",
        discount_id: input.discountId || null,
      })
      .select()
      .single();

    if (subErr || !newSub) {
      console.error("Error creating subscription:", subErr);
      return { success: false, error: subErr?.message || "Failed to create subscription record." };
    }

    // 4. Compute line items
    const linesToInsert: any[] = [];
    for (const line of input.lines) {
      const prod = (prods || []).find((p) => p.id === line.productId);
      const basePrice = Number(prod?.sales_price || 0);

      let priceExtra = 0;
      if (line.variantId) {
        const v = (variants || []).find((vr) => vr.id === line.variantId);
        if (v) priceExtra = Number(v.price_extra);
      }

      const unitPrice = basePrice + priceExtra;
      const amount = unitPrice * line.quantity;

      linesToInsert.push({
        subscription_id: newSub.id,
        product_id: line.productId,
        variant_id: line.variantId || null,
        quantity: line.quantity,
        unit_price: unitPrice,
        tax_rate: 10.0,
        amount,
      });
    }

    const { error: linesErr } = await supabase.from("subscription_lines").insert(linesToInsert);
    if (linesErr) {
      console.error("Error inserting subscription lines:", linesErr);
      return { success: false, error: `Subscription created but lines failed: ${linesErr.message}` };
    }

    return await getSubscriptionByIdService(newSub.id);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create subscription.";
    return { success: false, error: msg };
  }
}

/**
 * Advances subscription stage along the lifecycle engine.
 * Draft -> Quotation -> Confirmed -> Active -> Closed
 */
export async function advanceSubscriptionStageService(
  id: string,
  nextStage: SubscriptionStatus,
  reason?: string,
  actorEmail?: string
): Promise<ServiceResult<Subscription>> {
  try {
    if (!id || !nextStage) {
      return { success: false, error: "Subscription ID and next stage are required." };
    }

    const supabase = createAdminClient();

    // 1. Fetch current status
    const { data: sub, error: fetchErr } = await supabase
      .from("subscriptions")
      .select("id, status")
      .eq("id", id)
      .single();

    if (fetchErr || !sub) {
      return { success: false, error: "Subscription not found." };
    }

    const currentStatus = sub.status as SubscriptionStatus;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(nextStage)) {
      return {
        success: false,
        error: `Invalid stage progression: Cannot advance from ${currentStatus.toUpperCase()} to ${nextStage.toUpperCase()}. Allowed: ${allowed.join(", ").toUpperCase()}`,
      };
    }

    // 2. Perform database update
    const { error: updateErr } = await supabase
      .from("subscriptions")
      .update({
        status: nextStage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    return await getSubscriptionByIdService(id);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to transition subscription stage.";
    return { success: false, error: msg };
  }
}
