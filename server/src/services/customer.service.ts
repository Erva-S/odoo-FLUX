import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { createAuditLog } from './audit.service.js';
import { UpdateCustomerProfileInput } from '../validators/customer.validator.js';

export async function getCustomerProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      customer: true,
    },
  });

  if (!user) {
    throw new AppError('Customer account not found.', 404);
  }

  return user;
}

export async function updateCustomerProfile(userId: string, input: UpdateCustomerProfileInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customer: true },
  });

  if (!user) {
    throw new AppError('Customer account not found.', 404);
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    // 1. Update user name if provided
    if (input.name && input.name !== user.name) {
      await tx.user.update({
        where: { id: userId },
        data: { name: input.name },
      });
    }

    // 2. Upsert customer detail record
    const customer = await tx.customer.upsert({
      where: { userId },
      create: {
        userId,
        companyName: input.companyName ?? null,
        contactNumber: input.contactNumber ?? null,
        billingAddress: input.billingAddress ?? null,
      },
      update: {
        companyName: input.companyName !== undefined ? input.companyName : undefined,
        contactNumber: input.contactNumber !== undefined ? input.contactNumber : undefined,
        billingAddress: input.billingAddress !== undefined ? input.billingAddress : undefined,
      },
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: 'CUSTOMER_PROFILE_UPDATED',
        entityType: 'Customer',
        entityId: customer.id,
        metadata: input,
      },
    });

    return {
      id: user.id,
      name: input.name || user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      customer,
    };
  });

  return updatedUser;
}
