import { createAdminClient } from "@/lib/supabase/admin";
import { Product, ProductVariant, Plan } from "@/lib/data/types";

export interface VariantInput {
  id?: string;
  attributeName: string;
  attributeValue: string;
  priceExtra: number;
}

export interface ProductInput {
  name: string;
  type?: string;
  salesPrice: number;
  costPrice?: number;
  notes?: string;
  variants?: VariantInput[];
}

export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch all products with their variants from Supabase PostgreSQL.
 */
export async function getProductsService(): Promise<ServiceResult<Product[]>> {
  try {
    const supabase = createAdminClient();

    const { data: productsData, error: prodError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (prodError) {
      console.error("Error fetching products:", prodError);
      return { success: false, error: prodError.message };
    }

    const { data: variantsData, error: varError } = await supabase
      .from("product_variants")
      .select("*")
      .order("created_at", { ascending: true });

    if (varError) {
      console.error("Error fetching variants:", varError);
      return { success: false, error: varError.message };
    }

    const variantsByProduct: Record<string, ProductVariant[]> = {};
    for (const v of variantsData || []) {
      if (!variantsByProduct[v.product_id]) {
        variantsByProduct[v.product_id] = [];
      }
      variantsByProduct[v.product_id].push({
        id: v.id,
        productId: v.product_id,
        attributeName: v.attribute_name,
        attributeValue: v.attribute_value,
        priceExtra: Number(v.price_extra),
      });
    }

    const products: Product[] = (productsData || []).map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type || "service",
      salesPrice: Number(p.sales_price),
      costPrice: Number(p.cost_price || 0),
      notes: p.notes || undefined,
      variants: variantsByProduct[p.id] || [],
    }));

    return { success: true, data: products };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load products from database";
    return { success: false, error: message };
  }
}

/**
 * Fetch all plans from Supabase PostgreSQL.
 */
export async function getPlansService(): Promise<ServiceResult<Plan[]>> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    if (error) {
      console.error("Error fetching plans:", error);
      return { success: false, error: error.message };
    }

    const plans: Plan[] = (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      billingPeriod: p.billing_period as "daily" | "weekly" | "monthly" | "yearly",
      minimumQuantity: p.minimum_quantity,
      availableFrom: p.available_from || undefined,
      availableTo: p.available_to || undefined,
      autoClose: Boolean(p.auto_close),
      allowEarlyClose: Boolean(p.allow_early_close),
      allowPause: Boolean(p.allow_pause),
      allowRenew: Boolean(p.allow_renew),
      description: p.description || undefined,
    }));

    return { success: true, data: plans };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load plans from database";
    return { success: false, error: message };
  }
}

/**
 * Create a new product and variants in Supabase PostgreSQL.
 */
export async function createProductService(input: ProductInput): Promise<ServiceResult<Product>> {
  try {
    const trimmedName = input.name?.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "Product name must be at least 2 characters." };
    }

    const salesPrice = Number(input.salesPrice);
    if (isNaN(salesPrice) || salesPrice <= 0) {
      return { success: false, error: "Base sales price must be a positive number." };
    }

    const costPrice = Number(input.costPrice || 0);
    if (isNaN(costPrice) || costPrice < 0) {
      return { success: false, error: "Cost price cannot be negative." };
    }

    const supabase = createAdminClient();

    const { data: newProd, error: insertProdError } = await supabase
      .from("products")
      .insert({
        name: trimmedName,
        type: input.type || "service",
        sales_price: salesPrice,
        cost_price: costPrice,
        notes: input.notes?.trim() || null,
      })
      .select()
      .single();

    if (insertProdError || !newProd) {
      return { success: false, error: insertProdError?.message || "Failed to create product" };
    }

    const variants: ProductVariant[] = [];
    if (input.variants && input.variants.length > 0) {
      const validVariants = input.variants
        .filter((v) => v.attributeName?.trim() && v.attributeValue?.trim())
        .map((v) => ({
          product_id: newProd.id,
          attribute_name: v.attributeName.trim(),
          attribute_value: v.attributeValue.trim(),
          price_extra: Number(v.priceExtra) || 0,
        }));

      if (validVariants.length > 0) {
        const { data: createdVariants, error: varError } = await supabase
          .from("product_variants")
          .insert(validVariants)
          .select();

        if (varError) {
          return {
            success: false,
            error: `Product created, but error saving variants: ${varError.message}`,
          };
        }

        for (const cv of createdVariants || []) {
          variants.push({
            id: cv.id,
            productId: cv.product_id,
            attributeName: cv.attribute_name,
            attributeValue: cv.attribute_value,
            priceExtra: Number(cv.price_extra),
          });
        }
      }
    }

    return {
      success: true,
      data: {
        id: newProd.id,
        name: newProd.name,
        type: newProd.type || "service",
        salesPrice: Number(newProd.sales_price),
        costPrice: Number(newProd.cost_price || 0),
        notes: newProd.notes || undefined,
        variants,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create product in database";
    return { success: false, error: message };
  }
}

/**
 * Update an existing product and variants in Supabase PostgreSQL.
 */
export async function updateProductService(
  id: string,
  input: ProductInput
): Promise<ServiceResult<Product>> {
  try {
    if (!id) {
      return { success: false, error: "Product ID is required for update." };
    }

    const trimmedName = input.name?.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "Product name must be at least 2 characters." };
    }

    const salesPrice = Number(input.salesPrice);
    if (isNaN(salesPrice) || salesPrice <= 0) {
      return { success: false, error: "Base sales price must be a positive number." };
    }

    const costPrice = Number(input.costPrice || 0);
    if (isNaN(costPrice) || costPrice < 0) {
      return { success: false, error: "Cost price cannot be negative." };
    }

    const supabase = createAdminClient();

    const { data: updatedProd, error: updateError } = await supabase
      .from("products")
      .update({
        name: trimmedName,
        type: input.type || "service",
        sales_price: salesPrice,
        cost_price: costPrice,
        notes: input.notes?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedProd) {
      return { success: false, error: updateError?.message || "Failed to update product" };
    }

    // Replace variants
    await supabase.from("product_variants").delete().eq("product_id", id);

    const variants: ProductVariant[] = [];
    if (input.variants && input.variants.length > 0) {
      const validVariants = input.variants
        .filter((v) => v.attributeName?.trim() && v.attributeValue?.trim())
        .map((v) => ({
          product_id: id,
          attribute_name: v.attributeName.trim(),
          attribute_value: v.attributeValue.trim(),
          price_extra: Number(v.priceExtra) || 0,
        }));

      if (validVariants.length > 0) {
        const { data: insertedVariants, error: insVarError } = await supabase
          .from("product_variants")
          .insert(validVariants)
          .select();

        if (insVarError) {
          return {
            success: false,
            error: `Product updated, but error saving variants: ${insVarError.message}`,
          };
        }

        for (const iv of insertedVariants || []) {
          variants.push({
            id: iv.id,
            productId: iv.product_id,
            attributeName: iv.attribute_name,
            attributeValue: iv.attribute_value,
            priceExtra: Number(iv.price_extra),
          });
        }
      }
    }

    return {
      success: true,
      data: {
        id: updatedProd.id,
        name: updatedProd.name,
        type: updatedProd.type || "service",
        salesPrice: Number(updatedProd.sales_price),
        costPrice: Number(updatedProd.cost_price || 0),
        notes: updatedProd.notes || undefined,
        variants,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update product in database";
    return { success: false, error: message };
  }
}

/**
 * Safely delete product from Supabase PostgreSQL.
 */
export async function deleteProductService(id: string): Promise<ServiceResult<{ id: string }>> {
  try {
    if (!id) {
      return { success: false, error: "Product ID is required for deletion." };
    }

    const supabase = createAdminClient();

    // Check references
    const { count: subLineCount } = await supabase
      .from("subscription_lines")
      .select("id", { count: "exact", head: true })
      .eq("product_id", id);

    if (subLineCount && subLineCount > 0) {
      return {
        success: false,
        error: `Cannot delete product: It is actively referenced in ${subLineCount} subscription line(s).`,
      };
    }

    const { count: invLineCount } = await supabase
      .from("invoice_lines")
      .select("id", { count: "exact", head: true })
      .eq("product_id", id);

    if (invLineCount && invLineCount > 0) {
      return {
        success: false,
        error: `Cannot delete product: It is actively referenced in ${invLineCount} invoice line(s).`,
      };
    }

    const { error: delError } = await supabase.from("products").delete().eq("id", id);

    if (delError) {
      return { success: false, error: delError.message };
    }

    return { success: true, data: { id } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete product from database";
    return { success: false, error: message };
  }
}

