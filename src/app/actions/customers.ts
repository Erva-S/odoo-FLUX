"use server";

import { revalidatePath } from "next/cache";
import {
  getCustomersService,
  getCustomerByIdService,
  createCustomerService,
  updateCustomerService,
  toggleCustomerStatusService,
  CustomerInput,
  CustomerListParams,
} from "@/lib/services/customers";

export async function getCustomersAction(params?: CustomerListParams) {
  return await getCustomersService(params);
}

export async function getCustomerByIdAction(id: string) {
  return await getCustomerByIdService(id);
}

export async function createCustomerAction(input: CustomerInput) {
  const result = await createCustomerService(input);
  if (result.success) {
    revalidatePath("/customers");
  }
  return result;
}

export async function updateCustomerAction(id: string, input: CustomerInput) {
  const result = await updateCustomerService(id, input);
  if (result.success) {
    revalidatePath("/customers");
  }
  return result;
}

export async function toggleCustomerStatusAction(id: string, isActive: boolean) {
  const result = await toggleCustomerStatusService(id, isActive);
  if (result.success) {
    revalidatePath("/customers");
  }
  return result;
}

