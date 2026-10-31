import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../config/database.js';
import * as authService from '../services/auth.service.js';
import * as customerService from '../services/customer.service.js';
import * as staffService from '../services/staff.service.js';
import { Role } from '../types/auth.js';

describe('Authentication & User Lifecycle Tests', () => {
  const testCustomerEmail = `test.customer.${Date.now()}@example.com`;
  let customerUserId: string;

  test('1. Successful customer registration with valid strong password', async () => {
    const res = await authService.registerCustomer({
      name: 'Test Customer',
      email: testCustomerEmail,
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    });

    assert.ok(res.user);
    assert.equal(res.user.email, testCustomerEmail);
    assert.equal(res.user.role, Role.CUSTOMER);
    assert.equal(res.user.isActive, true);
    assert.ok(res.token);

    customerUserId = res.user.id;
  });

  test('2. Duplicate email registration rejection', async () => {
    await assert.rejects(
      async () => {
        await authService.registerCustomer({
          name: 'Duplicate Customer',
          email: testCustomerEmail,
          password: 'StrongPassword123!',
          confirmPassword: 'StrongPassword123!',
        });
      },
      {
        message: 'An account with this email address already exists.',
      }
    );
  });

  test('3. Successful login with correct credentials', async () => {
    const res = await authService.login({
      email: testCustomerEmail,
      password: 'StrongPassword123!',
    });

    assert.ok(res.token);
    assert.equal(res.user.email, testCustomerEmail);
    assert.equal(res.user.role, Role.CUSTOMER);
  });

  test('4. Incorrect password rejection', async () => {
    await assert.rejects(
      async () => {
        await authService.login({
          email: testCustomerEmail,
          password: 'WrongPassword999!',
        });
      },
      {
        message: 'Invalid email or password.',
      }
    );
  });

  test('5. Non-existent email login rejection with generic error', async () => {
    await assert.rejects(
      async () => {
        await authService.login({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        });
      },
      {
        message: 'Invalid email or password.',
      }
    );
  });

  test('6. Forgot password flow generates secure token without leaking email existence', async () => {
    const res = await authService.forgotPassword(testCustomerEmail);
    assert.equal(res.success, true);
    assert.equal(
      res.message,
      'If that email is registered, password reset instructions have been sent.'
    );

    // Verify token was created in DB
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: { userId: customerUserId },
      orderBy: { createdAt: 'desc' },
    });

    assert.ok(tokenRecord);
    assert.equal(tokenRecord.usedAt, null);
    assert.ok(tokenRecord.expiresAt > new Date());
  });

  test('7. Non-existent email forgot-password flow returns identical generic message', async () => {
    const res = await authService.forgotPassword('nobody@example.com');
    assert.equal(res.success, true);
    assert.equal(
      res.message,
      'If that email is registered, password reset instructions have been sent.'
    );
  });

  test('8. Deactivated account cannot authenticate', async () => {
    // Temporarily deactivate test user
    await prisma.user.update({
      where: { id: customerUserId },
      data: { isActive: false },
    });

    await assert.rejects(
      async () => {
        await authService.login({
          email: testCustomerEmail,
          password: 'StrongPassword123!',
        });
      },
      {
        message: 'Your account has been deactivated. Please contact an administrator.',
      }
    );

    // Reactivate for further tests
    await prisma.user.update({
      where: { id: customerUserId },
      data: { isActive: true },
    });
  });

  test('9. Can successfully reset password with valid token and strong new password', async () => {
    // Generate fresh reset token
    const rawToken = 'test-recovery-token-xyz-1234567890';
    const { hashToken } = await import('../utils/token.js');
    const tokenHash = hashToken(rawToken);

    await prisma.passwordResetToken.create({
      data: {
        userId: customerUserId,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    });

    const resetRes = await authService.resetPassword({
      token: rawToken,
      password: 'BrandNewPassword123#',
      confirmPassword: 'BrandNewPassword123#',
    });

    assert.equal(resetRes.success, true);

    // Verify user can log in with new password
    const loginRes = await authService.login({
      email: testCustomerEmail,
      password: 'BrandNewPassword123#',
    });
    assert.ok(loginRes.token);

    // Verify old password fails
    await assert.rejects(async () => {
      await authService.login({
        email: testCustomerEmail,
        password: 'StrongPassword123!',
      });
    }, {
      message: 'Invalid email or password.',
    });
  });

  test('10. Can sync password updated via Supabase Auth recovery session', async () => {
    const syncRes = await authService.syncPassword({
      email: testCustomerEmail,
      password: 'SupabaseSyncedPass456$',
    });

    assert.equal(syncRes.success, true);

    // Verify login with newly synced password
    const loginRes = await authService.login({
      email: testCustomerEmail,
      password: 'SupabaseSyncedPass456$',
    });
    assert.ok(loginRes.token);
  });

  after(async () => {
    // Clean up test user
    if (customerUserId) {
      await prisma.user.delete({ where: { id: customerUserId } }).catch(() => {});
    }
  });
});
