import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signJwt } from '../utils/jwt.js';
import { generateRandomToken, hashToken } from '../utils/token.js';
import { sendPasswordResetEmail } from '../utils/email.js';
import { AppError } from '../middleware/error.middleware.js';
import { createAuditLog } from './audit.service.js';
import { RegisterInput, LoginInput, ResetPasswordInput } from '../validators/auth.validator.js';
import { Role } from '../types/auth.js';

export async function registerCustomer(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError('An account with this email address already exists.', 409);
  }

  const passwordHash = await hashPassword(input.password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: Role.CUSTOMER,
        isActive: true,
        emailVerified: false,
        customer: {
          create: {},
        },
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

    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: 'CUSTOMER_REGISTRATION',
        entityType: 'User',
        entityId: user.id,
        metadata: { email: user.email },
      },
    });

    return user;
  });

  const token = signJwt({
    userId: result.id,
    email: result.email,
    role: result.role,
  });

  return { user: result, token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      customer: true,
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact an administrator.', 403);
  }

  const token = signJwt({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await createAuditLog({
    userId: user.id,
    action: 'USER_LOGIN',
    entityType: 'User',
    entityId: user.id,
    metadata: { email: user.email, role: user.role },
  });

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    customer: user.customer,
  };

  return { user: safeUser, token };
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Always return identical success message to prevent user enumeration
  const genericResponse = {
    success: true,
    message: 'If that email is registered, password reset instructions have been sent.',
  };

  if (!user || !user.isActive) {
    return genericResponse;
  }

  const rawToken = generateRandomToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  await sendPasswordResetEmail(user.email, rawToken);

  await createAuditLog({
    userId: user.id,
    action: 'PASSWORD_RESET_REQUESTED',
    entityType: 'User',
    entityId: user.id,
  });

  return genericResponse;
}

export async function resetPassword(input: ResetPasswordInput) {
  const tokenHash = hashToken(input.token);

  const resetTokenRecord = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!resetTokenRecord || !resetTokenRecord.user) {
    throw new AppError('Invalid or expired password reset token.', 400);
  }

  const newPasswordHash = await hashPassword(input.password);

  await prisma.$transaction(async (tx) => {
    // 1. Update user password
    await tx.user.update({
      where: { id: resetTokenRecord.userId },
      data: { passwordHash: newPasswordHash },
    });

    // 2. Mark this token as used
    await tx.passwordResetToken.update({
      where: { id: resetTokenRecord.id },
      data: { usedAt: new Date() },
    });

    // 3. Invalidate any other active reset tokens for this user
    await tx.passwordResetToken.updateMany({
      where: {
        userId: resetTokenRecord.userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // 4. Audit log
    await tx.auditLog.create({
      data: {
        userId: resetTokenRecord.userId,
        action: 'PASSWORD_RESET_COMPLETED',
        entityType: 'User',
        entityId: resetTokenRecord.userId,
      },
    });
  });

  return {
    success: true,
    message: 'Your password has been successfully reset. You can now log in with your new password.',
  };
}

export async function syncPassword(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    return {
      success: true,
      message: 'Password successfully updated.',
    };
  }

  const newPasswordHash = await hashPassword(input.password);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });

  await createAuditLog({
    userId: user.id,
    action: 'PASSWORD_RESET_SYNC_COMPLETED',
    entityType: 'User',
    entityId: user.id,
    metadata: { source: 'SUPABASE_AUTH_RECOVERY' },
  });

  return {
    success: true,
    message: 'Password successfully updated.',
  };
}
