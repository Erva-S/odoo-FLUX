import { createAdminClient } from "@/lib/supabase/admin";
import { Profile } from "@/lib/data/types";

export interface CustomerInput {
  name: string;
  email: string;
  companyName?: string;
  phone?: string;
  billingAddress?: string;
  isActive?: boolean;
}

export interface CustomerListParams {
  search?: string;
  page?: number;
  pageSize?: number;
  activeOnly?: boolean;
}

export interface CustomerListResult {
  customers: (Profile & { subscriptionCount: number; isActive: boolean })[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch paginated customer entities from PostgreSQL profiles table.
 */
export async function getCustomersService(
  params: CustomerListParams = {}
): Promise<ServiceResult<CustomerListResult>> {
  try {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 15);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = createAdminClient();

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    if (params.search) {
      const q = params.search.trim();
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,company_name.ilike.%${q}%`);
    }

    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error("Error fetching customers:", error);
      return { success: false, error: error.message };
    }

    // Fetch subscription counts
    const customerIds = (data || []).map((p) => p.id);
    let subCountsMap = new Map<string, number>();

    if (customerIds.length > 0) {
      const { data: subRows } = await supabase
        .from("subscriptions")
        .select("customer_id")
        .in("customer_id", customerIds);

      for (const row of subRows || []) {
        subCountsMap.set(row.customer_id, (subCountsMap.get(row.customer_id) || 0) + 1);
      }
    }

    const customers = (data || []).map((p) => ({
      id: p.id,
      email: p.email,
      name: p.name,
      role: p.role,
      companyName: p.company_name || undefined,
      phone: p.phone || undefined,
      billingAddress: p.billing_address || undefined,
      isActive: (p as any).is_active ?? true,
      createdAt: p.created_at,
      subscriptionCount: subCountsMap.get(p.id) || 0,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      success: true,
      data: {
        customers,
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load customers from database.";
    return { success: false, error: msg };
  }
}

/**
 * Fetch a single customer by ID with their active subscriptions from PostgreSQL.
 */
export async function getCustomerByIdService(id: string): Promise<ServiceResult<any>> {
  try {
    if (!id) return { success: false, error: "Customer ID required." };

    const supabase = createAdminClient();

    const { data: customer, error: custError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (custError || !customer) {
      return { success: false, error: custError?.message || "Customer not found." };
    }

    const { data: subs } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("customer_id", id)
      .order("created_at", { ascending: false });

    return {
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        role: customer.role,
        companyName: customer.company_name || undefined,
        phone: customer.phone || undefined,
        billingAddress: customer.billing_address || undefined,
        isActive: (customer as any).is_active ?? true,
        createdAt: customer.created_at,
        subscriptions: subs || [],
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load customer details.";
    return { success: false, error: msg };
  }
}

/**
 * Create a new customer entity in PostgreSQL profiles table.
 */
export async function createCustomerService(input: CustomerInput): Promise<ServiceResult<Profile>> {
  try {
    const trimmedName = input.name?.trim();
    const trimmedEmail = input.email?.toLowerCase().trim();

    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "Customer name must be at least 2 characters." };
    }

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      return { success: false, error: "A valid email address is required." };
    }

    const supabase = createAdminClient();

    // Check email uniqueness
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", trimmedEmail)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "A customer with this email already exists." };
    }

    const insertPayload: any = {
      name: trimmedName,
      email: trimmedEmail,
      company_name: input.companyName?.trim() || null,
      phone: input.phone?.trim() || null,
      billing_address: input.billingAddress?.trim() || null,
      role: "customer",
    };

    if (input.isActive !== undefined) {
      insertPayload.is_active = input.isActive;
    }

    const { data: newCust, error: insertError } = await supabase
      .from("profiles")
      .insert(insertPayload)
      .select()
      .single();

    if (insertError || !newCust) {
      return { success: false, error: insertError?.message || "Failed to create customer." };
    }

    return {
      success: true,
      data: {
        id: newCust.id,
        email: newCust.email,
        name: newCust.name,
        role: newCust.role,
        companyName: newCust.company_name || undefined,
        phone: newCust.phone || undefined,
        billingAddress: newCust.billing_address || undefined,
        createdAt: newCust.created_at,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create customer.";
    return { success: false, error: msg };
  }
}

/**
 * Update an existing customer entity.
 */
export async function updateCustomerService(
  id: string,
  input: CustomerInput
): Promise<ServiceResult<Profile>> {
  try {
    if (!id) return { success: false, error: "Customer ID is required." };

    const trimmedName = input.name?.trim();
    const trimmedEmail = input.email?.toLowerCase().trim();

    if (!trimmedName || !trimmedEmail) {
      return { success: false, error: "Name and email are required." };
    }

    const supabase = createAdminClient();

    const updatePayload: any = {
      name: trimmedName,
      email: trimmedEmail,
      company_name: input.companyName?.trim() || null,
      phone: input.phone?.trim() || null,
      billing_address: input.billingAddress?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (input.isActive !== undefined) {
      updatePayload.is_active = input.isActive;
    }

    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      return { success: false, error: updateError?.message || "Failed to update customer." };
    }

    return {
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        companyName: updated.company_name || undefined,
        phone: updated.phone || undefined,
        billingAddress: updated.billing_address || undefined,
        createdAt: updated.created_at,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update customer.";
    return { success: false, error: msg };
  }
}

/**
 * Toggle customer account active status (activate / deactivate).
 */
export async function toggleCustomerStatusService(
  id: string,
  isActive: boolean
): Promise<ServiceResult<{ id: string; isActive: boolean }>> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: isActive, updated_at: new Date().toISOString() } as any)
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true, data: { id, isActive } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to toggle customer status.";
    return { success: false, error: msg };
  }
}
