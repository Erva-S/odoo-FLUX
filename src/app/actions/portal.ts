"use server";

import { revalidatePath } from "next/cache";
import {
  getCustomerPortalData,
  updateCustomerOwnProfile,
  CustomerPortalData,
} from "@/lib/services/customer-portal";
import { recordPayment } from "@/lib/services/payments";

export async function fetchCustomerPortalDataAction(): Promise<{
  success: boolean;
  error?: string;
  data?: CustomerPortalData;
}> {
  try {
    return await getCustomerPortalData();
  } catch (err: any) {
    console.error("fetchCustomerPortalDataAction error:", err);
    return { success: false, error: err.message || "Failed to load portal data" };
  }
}

export async function updateCustomerOwnProfileAction(details: {
  name?: string;
  companyName?: string;
  billingAddress?: string;
  phone?: string;
}) {
  try {
    const res = await updateCustomerOwnProfile(details);
    if (res.success) {
      revalidatePath("/portal");
    }
    return res;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update profile." };
  }
}

export async function payInvoiceSelfServiceAction(invoiceId: string, amount: number) {
  try {
    const res = await recordPayment({
      invoiceId,
      amount,
      method: "credit_card",
      note: "Customer self-service portal online payment",
    });
    if (res.success) {
      revalidatePath("/portal");
      revalidatePath("/invoices");
      revalidatePath("/dashboard");
    }
    return res;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to complete payment." };
  }
}

