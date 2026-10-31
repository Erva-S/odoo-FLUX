"use server";

import { revalidatePath } from "next/cache";
import {
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  createInvoice,
  InvoiceQueryParams,
} from "@/lib/services/invoices";
import { executeRecurringBillingRun } from "@/lib/services/billing-engine";
import { Invoice } from "@/lib/data/types";

export async function executeBillingRunAction() {
  try {
    const result = await executeRecurringBillingRun();
    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    return result;
  } catch (err: any) {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      executionTimeMs: 0,
      totalEligible: 0,
      createdCount: 0,
      skippedCount: 0,
      failedCount: 1,
      errors: [{ subscriptionNumber: "ALL", error: err.message || "Failed to execute billing run." }],
      invoicesCreated: [],
    };
  }
}


export async function fetchInvoicesAction(params?: InvoiceQueryParams) {
  try {
    return await getInvoices(params);
  } catch (err: any) {
    console.error("fetchInvoicesAction error:", err);
    return {
      invoices: [],
      totalCount: 0,
      page: 1,
      pageSize: 15,
      totalPages: 1,
    };
  }
}

export async function fetchInvoiceByIdAction(idOrNumber: string): Promise<Invoice | null> {
  try {
    return await getInvoiceById(idOrNumber);
  } catch (err: any) {
    console.error("fetchInvoiceByIdAction error:", err);
    return null;
  }
}

export async function updateInvoiceStatusAction(
  invoiceId: string,
  newStatus: "draft" | "confirmed" | "paid" | "cancelled"
): Promise<{ success: boolean; error?: string; invoice?: Invoice }> {
  try {
    const result = await updateInvoiceStatus(invoiceId, newStatus);
    if (result.success) {
      revalidatePath("/invoices");
      revalidatePath(`/invoices/${invoiceId}`);
      revalidatePath("/dashboard");
    }
    return result;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update invoice status." };
  }
}

export async function createInvoiceAction(params: {
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
}): Promise<{ success: boolean; error?: string; invoice?: Invoice }> {
  try {
    const result = await createInvoice(params);
    if (result.success) {
      revalidatePath("/invoices");
      revalidatePath("/dashboard");
    }
    return result;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create invoice." };
  }
}
