import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { Invoice, Subscription, Payment } from "@/lib/data/types";
import { getInvoices } from "./invoices";
import { getSubscriptionsService } from "./subscriptions";
import { getPayments } from "./payments";

export interface CustomerPortalData {
  profile: {
    id: string;
    email: string;
    name: string;
    companyName?: string;
    billingAddress?: string;
    phone?: string;
    role: string;
  };
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  summary: {
    whatIPay: number;
    whenItRenews: string;
    whatIOwe: number;
    activeCount: number;
  };
}

/**
 * Fetch strictly isolated customer portal records for the currently authenticated Supabase session.
 * Enforces server-side ownership verification: never trusts client parameters.
 */
export async function getCustomerPortalData(): Promise<{ success: boolean; error?: string; data?: CustomerPortalData }> {
  const supabase = await createServerSupabaseClient();

  // 1. Authenticate session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthenticated. Please log in." };
  }

  // 2. Resolve Profile
  const adminClient = getAdminSupabaseClient();
  const { data: profile, error: profError } = await (adminClient as any)
    .from("profiles")
    .select("id, email, name, company_name, billing_address, phone, role")
    .or(`id.eq.${user.id},email.eq.${user.email?.toLowerCase()}`)
    .maybeSingle();

  if (profError || !profile) {
    return { success: false, error: "Customer profile not found in database." };
  }

  const profileId = profile.id;

  // 3. Query Customer's Own Subscriptions
  const subResult = await getSubscriptionsService({
    customerId: profileId,
    pageSize: 50,
  });
  const subscriptions = subResult.data?.subscriptions || [];

  // 4. Query Customer's Own Invoices
  const invResult = await getInvoices({
    customerId: profileId,
    pageSize: 50,
  });
  const invoices = invResult.invoices || [];

  // 5. Query Customer's Own Payments
  const payResult = await getPayments({
    customerId: profileId,
    pageSize: 50,
  });
  const payments = payResult.payments || [];

  // 6. Calculate Status Cards
  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const primarySub = activeSubs[0] || subscriptions[0];
  const whatIPay = primarySub ? primarySub.totalAmount : 0;
  const whenItRenews = primarySub?.expiryDate || "N/A";

  const unpaidInvoices = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled");
  const whatIOwe = unpaidInvoices.reduce((acc, i) => acc + Math.max(0, i.totalAmount - i.amountPaid), 0);

  return {
    success: true,
    data: {
      profile: {
        id: profile.id,
        email: profile.email,
        name: profile.name || "Customer",
        companyName: profile.company_name || undefined,
        billingAddress: profile.billing_address || undefined,
        phone: profile.phone || undefined,
        role: profile.role,
      },
      subscriptions,
      invoices,
      payments,
      summary: {
        whatIPay: Math.round(whatIPay * 100) / 100,
        whenItRenews,
        whatIOwe: Math.round(whatIOwe * 100) / 100,
        activeCount: activeSubs.length,
      },
    },
  };
}

/**
 * Update authenticated customer's own contact & company details in PostgreSQL.
 */
export async function updateCustomerOwnProfile(details: {
  name?: string;
  companyName?: string;
  billingAddress?: string;
  phone?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthenticated" };
  }

  const adminClient = getAdminSupabaseClient();
  const { error: updateErr } = await (adminClient as any)
    .from("profiles")
    .update({
      name: details.name,
      company_name: details.companyName,
      billing_address: details.billingAddress,
      phone: details.phone,
      updated_at: new Date().toISOString(),
    })
    .or(`id.eq.${user.id},email.eq.${user.email?.toLowerCase()}`);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  return { success: true };
}

