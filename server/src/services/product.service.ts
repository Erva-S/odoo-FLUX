import { prisma } from '../config/database.js';
import { ProductStatus, Prisma } from '@prisma/client';
import {
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
  QueryProductInput,
} from '../validators/product.validator.js';
import { createAuditLog } from './audit.service.js';

export async function listProducts(query: QueryProductInput) {
  const { page, limit, search, status, category, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status as ProductStatus;
  }

  if (category && category !== 'All') {
    where.category = category;
  }

  const [total, items, activeCount, inactiveCount] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        variants: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { plans: true, variants: true },
        },
      },
    }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.product.count({ where: { status: 'INACTIVE' } }),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
    metrics: {
      total,
      activeCount,
      inactiveCount,
    },
  };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        orderBy: { createdAt: 'asc' },
      },
      plans: {
        include: {
          variant: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { plans: true, variants: true },
      },
    },
  });

  if (!product) {
    const error = new Error(`Product with ID '${id}' not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  return product;
}

export async function createProduct(input: CreateProductInput, actorUserId?: string) {
  // 1. Check code uniqueness
  const existing = await prisma.product.findUnique({
    where: { code: input.code },
  });

  if (existing) {
    const error = new Error(`Product with code '${input.code}' already exists`);
    (error as any).statusCode = 409;
    throw error;
  }

  // 2. Validate variant codes if provided
  if (input.variants && input.variants.length > 0) {
    const variantCodes = input.variants.map((v) => v.code);
    const existingVariants = await prisma.productVariant.findMany({
      where: { code: { in: variantCodes } },
      select: { code: true },
    });

    if (existingVariants.length > 0) {
      const duplicateCode = existingVariants[0].code;
      const error = new Error(`Product variant with code '${duplicateCode}' already exists`);
      (error as any).statusCode = 409;
      throw error;
    }
  }

  // 3. Create product and variants in transaction
  const product = await prisma.$transaction(async (tx) => {
    return tx.product.create({
      data: {
        name: input.name,
        code: input.code.toUpperCase(),
        description: input.description,
        category: input.category,
        status: input.status as ProductStatus,
        variants: input.variants && input.variants.length > 0
          ? {
              create: input.variants.map((v) => ({
                name: v.name,
                code: v.code.toUpperCase(),
                description: v.description,
                price: new Prisma.Decimal(v.price),
                status: v.status as ProductStatus,
              })),
            }
          : undefined,
      },
      include: {
        variants: true,
      },
    });
  });

  // Audit log
  if (actorUserId) {
    await createAuditLog({
      userId: actorUserId,
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: product.id,
      metadata: { code: product.code, name: product.name, category: product.category },
    });
  }

  return product;
}

export async function updateProduct(id: string, input: UpdateProductInput, actorUserId?: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const error = new Error(`Product with ID '${id}' not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  // Check code uniqueness if changing code
  if (input.code && input.code.toUpperCase() !== product.code) {
    const existing = await prisma.product.findUnique({
      where: { code: input.code.toUpperCase() },
    });
    if (existing) {
      const error = new Error(`Product with code '${input.code}' already exists`);
      (error as any).statusCode = 409;
      throw error;
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      code: input.code ? input.code.toUpperCase() : undefined,
      description: input.description,
      category: input.category,
      status: input.status as ProductStatus | undefined,
    },
    include: {
      variants: true,
      _count: { select: { plans: true, variants: true } },
    },
  });

  if (actorUserId) {
    await createAuditLog({
      userId: actorUserId,
      action: 'PRODUCT_UPDATED',
      entityType: 'Product',
      entityId: id,
      metadata: { changedFields: Object.keys(input) },
    });
  }

  return updated;
}

export async function updateProductStatus(id: string, status: ProductStatus, actorUserId?: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const error = new Error(`Product with ID '${id}' not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { status },
    include: { variants: true },
  });

  if (actorUserId) {
    await createAuditLog({
      userId: actorUserId,
      action: 'PRODUCT_STATUS_CHANGED',
      entityType: 'Product',
      entityId: id,
      metadata: { previousStatus: product.status, newStatus: status },
    });
  }

  return updated;
}

export async function deleteProduct(id: string, actorUserId?: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: { select: { plans: true, variants: true } },
    },
  });

  if (!product) {
    const error = new Error(`Product with ID '${id}' not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  // Prevent deletion if referenced by plans
  if (product._count.plans > 0) {
    const error = new Error(
      `Cannot delete product '${product.name}' because it is associated with ${product._count.plans} plan(s). Deactivate or archive it instead.`
    );
    (error as any).statusCode = 400;
    throw error;
  }

  // If variants exist, delete them or enforce restrict
  await prisma.$transaction(async (tx) => {
    await tx.productVariant.deleteMany({ where: { productId: id } });
    await tx.product.delete({ where: { id } });
  });

  if (actorUserId) {
    await createAuditLog({
      userId: actorUserId,
      action: 'PRODUCT_DELETED',
      entityType: 'Product',
      entityId: id,
      metadata: { name: product.name, code: product.code },
    });
  }

  return { message: `Product '${product.name}' deleted successfully` };
}

// ==========================================
// Product Variants Operations
// ==========================================

export async function listVariantsByProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, code: true, status: true },
  });

  if (!product) {
    const error = new Error(`Product with ID '${productId}' not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  const variants = await prisma.productVariant.findMany({
    where: { productId },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { plans: true } },
    },
  });

  return { product, variants };
}

export async function createVariant(productId: string, input: CreateVariantInput, actorUserId?: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    const error = new Error(`Product with ID '${productId}' not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  const existing = await prisma.productVariant.findUnique({
    where: { code: input.code.toUpperCase() },
  });

  if (existing) {
    const error = new Error(`Variant with code '${input.code}' already exists`);
    (error as any).statusCode = 409;
    throw error;
  }

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      name: input.name,
      code: input.code.toUpperCase(),
      description: input.description,
      price: new Prisma.Decimal(input.price),
      status: input.status as ProductStatus,
    },
  });

  if (actorUserId) {
    await createAuditLog({
      userId: actorUserId,
      action: 'VARIANT_CREATED',
      entityType: 'ProductVariant',
      entityId: variant.id,
      metadata: { productId, code: variant.code, price: input.price },
    });
  }

  return variant;
}

export async function updateVariant(id: string, input: UpdateVariantInput, actorUserId?: string) {
  const variant = await prisma.productVariant.findUnique({ where: { id } });
  if (!variant) {
    const error = new Error(`Variant with ID '${id}' not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  if (input.code && input.code.toUpperCase() !== variant.code) {
    const existing = await prisma.productVariant.findUnique({
      where: { code: input.code.toUpperCase() },
    });
    if (existing) {
      const error = new Error(`Variant with code '${input.code}' already exists`);
      (error as any).statusCode = 409;
      throw error;
    }
  }

  const updated = await prisma.productVariant.update({
    where: { id },
    data: {
      name: input.name,
      code: input.code ? input.code.toUpperCase() : undefined,
      description: input.description,
      price: input.price !== undefined ? new Prisma.Decimal(input.price) : undefined,
      status: input.status as ProductStatus | undefined,
    },
  });

  if (actorUserId) {
    await createAuditLog({
      userId: actorUserId,
      action: 'VARIANT_UPDATED',
      entityType: 'ProductVariant',
      entityId: id,
      metadata: { changedFields: Object.keys(input) },
    });
  }

  return updated;
}

export async function updateVariantStatus(id: string, status: ProductStatus, actorUserId?: string) {
  const variant = await prisma.productVariant.findUnique({ where: { id } });
  if (!variant) {
    const error = new Error(`Variant with ID '${id}' not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  const updated = await prisma.productVariant.update({
    where: { id },
    data: { status },
  });

  if (actorUserId) {
    await createAuditLog({
      userId: actorUserId,
      action: 'VARIANT_STATUS_CHANGED',
      entityType: 'ProductVariant',
      entityId: id,
      metadata: { previousStatus: variant.status, newStatus: status },
    });
  }

  return updated;
}

export async function deleteVariant(id: string, actorUserId?: string) {
  const variant = await prisma.productVariant.findUnique({
    where: { id },
    include: { _count: { select: { plans: true } } },
  });

  if (!variant) {
    const error = new Error(`Variant with ID '${id}' not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  if (variant._count.plans > 0) {
    const error = new Error(
      `Cannot delete variant '${variant.name}' because it is associated with ${variant._count.plans} plan(s). Deactivate it instead.`
    );
    (error as any).statusCode = 400;
    throw error;
  }

  await prisma.productVariant.delete({ where: { id } });

  if (actorUserId) {
    await createAuditLog({
      userId: actorUserId,
      action: 'VARIANT_DELETED',
      entityType: 'ProductVariant',
      entityId: id,
      metadata: { name: variant.name, code: variant.code },
    });
  }

  return { message: `Variant '${variant.name}' deleted successfully` };
}

