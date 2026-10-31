"use server";

import { revalidatePath } from "next/cache";
import {
  getProductsService,
  getPlansService,
  createProductService,
  updateProductService,
  deleteProductService,
  ProductInput,
} from "@/lib/services/catalog";

export async function getProductsAction() {
  return await getProductsService();
}

export async function getPlansAction() {
  return await getPlansService();
}

export async function createProductAction(input: ProductInput) {
  const result = await createProductService(input);
  if (result.success) {
    revalidatePath("/catalog");
  }
  return result;
}

export async function updateProductAction(id: string, input: ProductInput) {
  const result = await updateProductService(id, input);
  if (result.success) {
    revalidatePath("/catalog");
  }
  return result;
}

export async function deleteProductAction(id: string) {
  const result = await deleteProductService(id);
  if (result.success) {
    revalidatePath("/catalog");
  }
  return result;
}
