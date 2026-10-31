import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../config/database.js';
import * as staffService from '../services/staff.service.js';
import * as customerService from '../services/customer.service.js';
import * as adminService from '../services/admin.service.js';
import { Role } from '../types/auth.js';

describe('RBAC & Profile Operations Tests', () => {
  let adminUser: any;
  let testStaffId: string;
  let testCustomerId: string;

  before(async () => {
    adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
    assert.ok(adminUser, 'Admin user should be seeded in database');
  });

  test('1. Admin can create new staff with strictly enforced STAFF role', async () => {
    const email = `test.staff.${Date.now()}@brightloop.io`;
    const res = await staffService.createStaff(
      {
        name: 'Test Staff Operator',
        email,
      },
      adminUser.id
    );

    assert.ok(res.staff);
    assert.equal(res.staff.email, email);
    assert.equal(res.staff.role, Role.STAFF);
    assert.ok(res.temporaryPassword);
    testStaffId = res.staff.id;
  });

  test('2. Admin can view staff list and staff member is present', async () => {
    const list = await staffService.listStaff();
    const found = list.find((s) => s.id === testStaffId);
    assert.ok(found);
    assert.equal(found.role, Role.STAFF);
  });

  test('3. Admin can activate and deactivate staff status', async () => {
    const deactivated = await staffService.updateStaffStatus(testStaffId, false, adminUser.id);
    assert.equal(deactivated.isActive, false);

    const reactivated = await staffService.updateStaffStatus(testStaffId, true, adminUser.id);
    assert.equal(reactivated.isActive, true);
  });

  test('4. Customer can view and update their own profile fields without altering role', async () => {
    const customerUser = await prisma.user.findFirst({ where: { role: Role.CUSTOMER } });
    assert.ok(customerUser);
    testCustomerId = customerUser.id;

    const updated = await customerService.updateCustomerProfile(testCustomerId, {
      name: 'Updated Customer Name',
      companyName: 'Updated Enterprise Corp Ltd',
      contactNumber: '+91 91234 56789',
      billingAddress: 'Tower 4B, Electronic City, Bangalore - 560100',
    });

    assert.equal(updated.name, 'Updated Customer Name');
    assert.equal(updated.customer?.companyName, 'Updated Enterprise Corp Ltd');
    assert.equal(updated.customer?.contactNumber, '+91 91234 56789');
    assert.equal(updated.role, Role.CUSTOMER); // Role remains CUSTOMER
  });

  test('5. Admin dashboard returns real DB telemetry and approved financial mock layout', async () => {
    const metrics = await adminService.getAdminDashboardMetrics();
    assert.ok(metrics.system);
    assert.ok(metrics.system.totalUsers >= 2);
    assert.equal(metrics.system.databaseStatus, 'OPERATIONAL');
    assert.equal(metrics.isMockFinancialData, true);
    assert.ok(metrics.financialSummary.mrr.value > 0);
    assert.ok(metrics.financialSummary.activeSubscriptions.value > 0);
  });

  after(async () => {
    if (testStaffId) {
      await prisma.user.delete({ where: { id: testStaffId } }).catch(() => {});
    }
  });
});
