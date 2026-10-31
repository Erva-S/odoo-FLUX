import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import { prisma } from '../config/database.js';
import * as productService from '../services/product.service.js';
import * as planService from '../services/plan.service.js';
import { login } from '../services/auth.service.js';

describe('Phase 2 — Products & Variants Lifecycle Tests', async () => {
  let adminUserId: string;
  let testProductId: string;
  let testVariantId: string;

  before(async () => {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@brightloop.io' },
    });
    if (admin) {
      adminUserId = admin.id;
    }
  });

  test('1. Admin can create a new Product with unique SKU code and variants', async () => {
    const code = `TEST-PROD-${Date.now()}`;
    const product = await productService.createProduct(
      {
        name: 'Cloud Storage Suite',
        code,
        description: 'Multi-cloud enterprise data store',
        category: 'Infrastructure',
        status: 'ACTIVE',
        variants: [
          {
            name: 'Basic — 100 GB',
            code: `${code}-V1`,
            description: '100 GB SSD storage tier',
            price: 1200,
            status: 'ACTIVE',
          },
          {
            name: 'Professional — 500 GB',
            code: `${code}-V2`,
            description: '500 GB NVMe storage tier',
            price: 4500,
            status: 'ACTIVE',
          },
        ],
      },
      adminUserId
    );

    assert.ok(product.id, 'Product ID should be generated');
    assert.strictEqual(product.code, code);
    assert.strictEqual(product.variants.length, 2);
    testProductId = product.id;
    testVariantId = product.variants[0].id;
  });

  test('2. Rejects duplicate product code with 409 conflict', async () => {
    const product = await prisma.product.findUnique({ where: { id: testProductId } });
    assert.ok(product);

    await assert.rejects(
      async () => {
        await productService.createProduct(
          {
            name: 'Another Storage Product',
            code: product.code, // duplicate
            category: 'Infrastructure',
            status: 'ACTIVE',
          },
          adminUserId
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 409);
        assert.match(err.message, /already exists/i);
        return true;
      }
    );
  });

  test('3. Can list products with search and category filters', async () => {
    const result = await productService.listProducts({
      page: 1,
      limit: 10,
      search: 'Cloud Storage',
      category: 'Infrastructure',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    assert.ok(result.items.length >= 1);
    const found = result.items.find((p) => p.id === testProductId);
    assert.ok(found, 'Created product should be present in search results');
    assert.ok(result.metrics.activeCount >= 1);
  });

  test('4. Can update product details and status', async () => {
    const updated = await productService.updateProduct(
      testProductId,
      {
        name: 'Cloud Storage Suite Ultra',
        description: 'Updated enterprise multi-cloud storage',
      },
      adminUserId
    );

    assert.strictEqual(updated.name, 'Cloud Storage Suite Ultra');

    const deactivated = await productService.updateProductStatus(testProductId, 'INACTIVE', adminUserId);
    assert.strictEqual(deactivated.status, 'INACTIVE');

    // Reactivate for downstream plan tests
    const reactivated = await productService.updateProductStatus(testProductId, 'ACTIVE', adminUserId);
    assert.strictEqual(reactivated.status, 'ACTIVE');
  });

  test('5. Can add an individual variant to an existing product', async () => {
    const variantCode = `TEST-VAR-ENT-${Date.now()}`;
    const variant = await productService.createVariant(
      testProductId,
      {
        name: 'Enterprise — 1 TB',
        code: variantCode,
        description: '1 TB High-speed cluster storage',
        price: 8900,
        status: 'ACTIVE',
      },
      adminUserId
    );

    assert.ok(variant.id);
    assert.strictEqual(variant.code, variantCode);
    assert.strictEqual(Number(variant.price), 8900);
  });

  test('6. Rejects duplicate variant code', async () => {
    const existing = await prisma.productVariant.findFirst({ where: { productId: testProductId } });
    assert.ok(existing);

    await assert.rejects(
      async () => {
        await productService.createVariant(
          testProductId,
          {
            name: 'Clashing Variant',
            code: existing.code,
            price: 999,
            status: 'ACTIVE',
          },
          adminUserId
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 409);
        return true;
      }
    );
  });
});

describe('Phase 2 — Subscription Plan Management Tests', async () => {
  let adminUserId: string;
  let productId: string;
  let variantId: string;
  let foreignProductId: string;
  let foreignVariantId: string;
  let testPlanId: string;

  before(async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@brightloop.io' } });
    if (admin) adminUserId = admin.id;

    // Create 2 products with variants for relationship testing
    const p1Code = `PLAN-TEST-P1-${Date.now()}`;
    const p1 = await productService.createProduct({
      name: 'Test Product A',
      code: p1Code,
      category: 'SaaS',
      status: 'ACTIVE',
      variants: [{ name: 'Variant A1', code: `${p1Code}-V1`, price: 500, status: 'ACTIVE' }],
    });
    productId = p1.id;
    variantId = p1.variants[0].id;

    const p2Code = `PLAN-TEST-P2-${Date.now()}`;
    const p2 = await productService.createProduct({
      name: 'Test Product B',
      code: p2Code,
      category: 'SaaS',
      status: 'ACTIVE',
      variants: [{ name: 'Variant B1', code: `${p2Code}-V1`, price: 900, status: 'ACTIVE' }],
    });
    foreignProductId = p2.id;
    foreignVariantId = p2.variants[0].id;
  });

  test('1. Admin can create a Subscription Plan with monthly frequency and features', async () => {
    const planCode = `PLN-MTH-${Date.now()}`;
    const plan = await planService.createPlan(
      {
        name: 'Starter Cloud Monthly',
        code: planCode,
        description: 'Monthly cloud plan with automatic renewal',
        productId,
        variantId,
        price: 500,
        billingFrequency: 'MONTHLY',
        status: 'ACTIVE',
        pauseLimitCycles: 2,
        cancellationNoticeDays: 30,
        trialPeriodDays: 7,
        features: ['100 GB Storage', 'Weekly Backup', 'Standard SLA'],
      },
      adminUserId
    );

    assert.ok(plan.id);
    assert.strictEqual(plan.code, planCode);
    assert.strictEqual(plan.billingFrequency, 'MONTHLY');
    assert.strictEqual(Number(plan.price), 500);
    testPlanId = plan.id;
  });

  test('2. Rejects duplicate plan code with 409 conflict', async () => {
    const plan = await prisma.plan.findUnique({ where: { id: testPlanId } });
    assert.ok(plan);

    await assert.rejects(
      async () => {
        await planService.createPlan(
          {
            name: 'Clashing Plan',
            code: plan.code,
            productId,
            price: 500,
            billingFrequency: 'MONTHLY',
            status: 'ACTIVE',
            pauseLimitCycles: 1,
            cancellationNoticeDays: 14,
            trialPeriodDays: 0,
          },
          adminUserId
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 409);
        return true;
      }
    );
  });

  test('3. Rejects plan creation if variant does NOT belong to the specified product', async () => {
    await assert.rejects(
      async () => {
        await planService.createPlan(
          {
            name: 'Invalid Cross-Product Plan',
            code: `INVALID-CROSS-${Date.now()}`,
            productId: productId, // Product A
            variantId: foreignVariantId, // Variant belongs to Product B!
            price: 1500,
            billingFrequency: 'MONTHLY',
            status: 'ACTIVE',
            pauseLimitCycles: 1,
            cancellationNoticeDays: 14,
            trialPeriodDays: 0,
          },
          adminUserId
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 400);
        assert.match(err.message, /does not belong to product/i);
        return true;
      }
    );
  });

  test('4. Rejects plan creation for INACTIVE products', async () => {
    const inactiveCode = `INACT-PROD-${Date.now()}`;
    const inactiveProd = await productService.createProduct({
      name: 'Legacy Product',
      code: inactiveCode,
      status: 'INACTIVE',
      category: 'Legacy',
    });

    await assert.rejects(
      async () => {
        await planService.createPlan(
          {
            name: 'Plan on Inactive Product',
            code: `PLN-INACT-${Date.now()}`,
            productId: inactiveProd.id,
            price: 100,
            billingFrequency: 'MONTHLY',
            status: 'ACTIVE',
            pauseLimitCycles: 1,
            cancellationNoticeDays: 14,
            trialPeriodDays: 0,
          },
          adminUserId
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 400);
        assert.match(err.message, /inactive/i);
        return true;
      }
    );
  });

  test('5. Prevents deletion of product while associated with a plan', async () => {
    await assert.rejects(
      async () => {
        await productService.deleteProduct(productId, adminUserId);
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 400);
        assert.match(err.message, /associated with/i);
        return true;
      }
    );
  });

  test('6. Can update plan details and toggle active/inactive status', async () => {
    const updated = await planService.updatePlan(
      testPlanId,
      {
        name: 'Starter Cloud Monthly (Enhanced)',
        price: 550,
        pauseLimitCycles: 3,
      },
      adminUserId
    );

    assert.strictEqual(updated.name, 'Starter Cloud Monthly (Enhanced)');
    assert.strictEqual(Number(updated.price), 550);
    assert.strictEqual(updated.pauseLimitCycles, 3);

    const deactivated = await planService.updatePlanStatus(testPlanId, 'INACTIVE', adminUserId);
    assert.strictEqual(deactivated.status, 'INACTIVE');
  });

  test('7. Can list plans with frequency and status filters', async () => {
    const result = await planService.listPlans({
      page: 1,
      limit: 10,
      billingFrequency: 'MONTHLY',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    assert.ok(result.items.length >= 1);
    assert.ok(result.items.every((p) => p.billingFrequency === 'MONTHLY'));
  });
});

