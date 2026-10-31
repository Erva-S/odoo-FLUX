"use server";

import { revalidatePath } from "next/cache";
import {
  getPayments,
  recordPayment,
  PaymentQueryParams,
} from "@/lib/services/payments";
import { Payment } from "@/lib/data/types";

export async function fetchPaymentsAction(params?: PaymentQueryParams) {
  try {
    return await getPayments(params);
  } catch (err: any) {
    console.error("fetchPaymentsAction error:", err);
    return {
      payments: [],
      totalCount: 0,
      page: 1,
      pageSize: 15,
      totalPages: 1,
    };
  }
}

export async function recordPaymentAction(params: {
  invoiceId: string;
  amount: number;
  method: Payment["method"];
  note?: string;
  paymentDate?: string;
}) {
  try {
    const result = await recordPayment(params);
    if (result.success) {
      revalidatePath("/payments");
      revalidatePath("/invoices");
      revalidatePath(`/invoices/${params.invoiceId}`);
      revalidatePath("/dashboard");
    }
    return result;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to record payment transaction." };
  }
}

