import { prisma } from '../config/database.js';
import { PlanStatus, BillingFrequency, Prisma } from '@prisma/client';
import { CreatePlanInput, UpdatePlanInput, QueryPlanInput } from '../validators/plan.validator.js';
import { createAuditLog } from './audit.service.js';

export async function listPlans(query: QueryPlanInput) {
  const { page, limit, search, status, billingFrequency, productId, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.PlanWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status as PlanStatus;
  }

  if (billingFrequency) {
    where.billingFrequency = billingFrequency as BillingFrequency;
  }

  if (productId) {
    where.productId = productId;
  }

  const [total, items, activeCount, inactiveCount] = await Promise.all([
    prisma.plan.count({ where }),
    prisma.plan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        product: {
          select: { id: true, name: true, code: true, category: true, status: true },
        },
        variant: {
          select: { id: true, name: true, code: true, price: true, status: true },
        },
      },
    }),
    prisma.plan.count({ where: { status: 'ACTIVE' } }),
    prisma.plan.count({ where: { status: 'INACTIVE' } }),
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

export async function getPlanById(id: string) {
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      product: {
        include: {
          variants: true,
        },
      },
      variant: true,
    },
  });

  if (!plan) {
    const error = new Error(`Subscription plan with ID '${id}' not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  return plan;
}

export async function createPlan(input: CreatePlanInput, actorUserId?: string) {
  // 1. Verify plan code uniqueness
  const existingCode = await prisma.plan.findUnique({
    where: { code: input.code.toUpperCase() },
  });
  if (existingCode) {
    const error = new Error(`Plan with code '${input.code}' already exists`);
    (error as any).statusCode = 409;
    throw error;
  }

  // 2. Verify associated Product exists and is ACTIVE
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    include: { variants: true },
  });

  if (!product) {
    const error = new Error(`Product with ID '${input.productId}' does not exist`);
    (error as any).statusCode = 404;
    throw error;
  }

  if (product.status !== 'ACTIVE') {
    const error = new Error(
      `Cannot create plan for product '${product.name}' because the product is ${product.status.toLowerCase()}. Only ACTIVE products can have new plans.`
    );
    (error as any).statusCode = 400;
    throw error;
  }

  // 3. If variantId provided, verify it exists and BELONGS to this product
  if (input.variantId) {
    const variant = product.variants.find((v) => v.id === input.variantId);
    if (!variant) {
      const error = new Error(
        `Variant with ID '${input.variantId}' does not belong to product '${product.name}'`
      );
      (error as any).statusCode = 400;
      throw error;
    }

    if (variant.status !== 'ACTIVE') {
      const error = new Error(
        `Cannot create plan for variant '${variant.name}' because the variant is ${variant.status.toLowerCase()}.`
      );
      (error as any).statusCode = 400;
      throw error;
    }
  }

  // 4. Create Plan
  const plan = await prisma.plan.create({
    data: {
      name: input.name,
      code: input.code.toUpperCase(),
      description: input.description,
      productId: input.productId,
      variantId: input.variantId || null,
      price: new Prisma.Decimal(input.price),
      billingFrequency: input.billingFrequency as BillingFrequency,
      status: input.status as PlanStatus,
      pauseLimitCycles: input.pauseLimitCycles,
      cancellationNoticeDays: input.cancellationNoticeDays,
      trialPeriodDays: input.trialPeriodDays,
      features: input.features || [],
    },
    include: {
      product: { select: { id: true, name: true, code: true } },
      variant: { select: { id: true, name: true, code: true, price: true } },
    },
  });

  // 5. Audit Log
  if (actorUserId) {
    await createAuditLog({
      userId: actorUserId,
      action: 'PLAN_CREATED',
      entityType: 'Plan',
      entityId: plan.id,
      metadata: { code: plan.code, price: input.price, billingFrequency: plan.billingFrequency },
    });
  }

  return plan;
}

export async function updatePlan(id: string, input: UpdatePlanInput, actorUserId?: string) {
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!plan) {
    const error = new Error(`Subscription plan with ID '${id}' not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  // Code uniqueness check
  if (input.code && input.code.toUpperCase() !== plan.code) {
    const existing = await prisma.plan.findUnique({
      where: { code: input.code.toUpperCase() },
    });
    if (existing) {
      const error = new Error(`Plan with code '${input.code}' already exists`);
      (error as any).statusCode = 409;
      throw error;
    }
  }

  const targetProductId = input.productId || plan.productId;

  // Validate variant relationship if variant changed
  if (input.variantId !== undefined && input.variantId !== null) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: input.variantId },
    });
    if (!variant || variant.productId !== targetProductId) {
      const error = new Error(
        `Variant with ID '${input.variantId}' does not belong to the plan's product`
      );
      (error as any).statusCode = 400;
      throw error;
    }
  }

  const updated = await prisma.plan.update({
    where: { id },
    data: {
      name: input.name,
      code: input.code ? input.code.toUpperCase() : undefined,
      description: input.description,
      productId: input.productId,
      variantId: input.variantId === null ? null : input.variantId,
      price: input.price !== undefined ? new Prisma.Decimal(input.price) : undefined,
      billingFrequency: input.billingFrequency as BillingFrequency | undefined,
      status: input.status as PlanStatus | undefined,
      pauseLimitCycles: input.pauseLimitCycles,
      cancellationNoticeDays: input.cancellationNoticeDays,
      trialPeriodDays: input.trialPeriodDays,
      features: input.features !== undefined ? input.features : undefined,
    },
    include: {
      product: { select: { id: true, name: true, code: true } },
      variant: { select: { id: true, name: true, code: true, price: true } },
    },
  });

  if (actorUserId) {
    await createAuditLog({
      userId: actorUserId,
      action: 'PLAN_UPDATED',
      entityType: 'Plan',
      entityId: id,
      metadata: { changedFields: Object.keys(input) },
    });
  }

  return updated;
}

export async function updatePlanStatus(id: string, status: PlanStatus, actorUserId?: string) {
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) {
    const error = new Error(`Subscription plan with ID '${id}' not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  const updated = await prisma.plan.update({
    where: { id },
    data: { status },
    include: {
      product: { select: { id: true, name: true, code: true } },
      variant: { select: { id: true, name: true, code: true } },
    },
  });

  if (actorUserId) {
    await createAuditLog({
      userId: actorUserId,
      action: 'PLAN_STATUS_CHANGED',
      entityType: 'Plan',
      entityId: id,
      metadata: { previousStatus: plan.status, newStatus: status },
    });
  }

  return updated;
}

export async function deletePlan(id: string, actorUserId?: string) {
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) {
    const error = new Error(`Subscription plan with ID '${id}' not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  await prisma.plan.delete({ where: { id } });

  if (actorUserId) {
    await createAuditLog({
      userId: actorUserId,
      action: 'PLAN_DELETED',
      entityType: 'Plan',
      entityId: id,
      metadata: { name: plan.name, code: plan.code },
    });
  }

  return { message: `Plan '${plan.name}' deleted successfully` };
}
