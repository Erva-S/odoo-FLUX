import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/password.js';
import { generateRandomToken } from '../utils/token.js';
import { AppError } from '../middleware/error.middleware.js';
import { createAuditLog } from './audit.service.js';
import { CreateStaffInput, UpdateStaffInput } from '../validators/staff.validator.js';
import { Role } from '../types/auth.js';

export async function listStaff() {
  return prisma.user.findMany({
    where: { role: Role.STAFF },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getStaffById(id: string) {
  const staff = await prisma.user.findFirst({
    where: { id, role: Role.STAFF },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!staff) {
    throw new AppError('Staff member not found.', 404);
  }

  return staff;
}

export async function createStaff(input: CreateStaffInput, adminId: string) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new AppError('An account with this email address already exists.', 409);
  }

  // Generate strong temporary password if not explicitly supplied
  const rawPassword = input.password || `Staff@${generateRandomToken(4).toUpperCase()}!`;
  const passwordHash = await hashPassword(rawPassword);

  const staff = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: Role.STAFF, // Strictly enforced STAFF role
      isActive: true,
      emailVerified: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  await createAuditLog({
    userId: adminId,
    action: 'STAFF_CREATED',
    entityType: 'User',
    entityId: staff.id,
    metadata: { createdStaffEmail: staff.email },
  });

  return { staff, temporaryPassword: rawPassword };
}

export async function updateStaff(id: string, input: UpdateStaffInput, adminId: string) {
  const staff = await prisma.user.findFirst({
    where: { id, role: Role.STAFF },
  });

  if (!staff) {
    throw new AppError('Staff member not found.', 404);
  }

  if (input.email && input.email !== staff.email) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw new AppError('Email is already taken by another account.', 409);
    }
  }

  const updatedStaff = await prisma.user.update({
    where: { id },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.email ? { email: input.email } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
      updatedAt: true,
    },
  });

  await createAuditLog({
    userId: adminId,
    action: 'STAFF_UPDATED',
    entityType: 'User',
    entityId: id,
    metadata: input,
  });

  return updatedStaff;
}

export async function updateStaffStatus(id: string, isActive: boolean, adminId: string) {
  const staff = await prisma.user.findFirst({
    where: { id, role: Role.STAFF },
  });

  if (!staff) {
    throw new AppError('Staff member not found.', 404);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
      updatedAt: true,
    },
  });

  await createAuditLog({
    userId: adminId,
    action: isActive ? 'STAFF_ACTIVATED' : 'STAFF_DEACTIVATED',
    entityType: 'User',
    entityId: id,
    metadata: { isActive },
  });

  return updated;
}
