import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import { prisma } from '../config/database.js';
import * as productService from '../services/product.service.js';
import * as planService from '../services/plan.service.js';
import { Role } from '@prisma/client';

describe('Product Management & Security Tests', async () => {
  let adminUserId: string;
  let testProductId: string;

  before(async () => {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@brightloop.io' },
    });
    if (admin) {
      adminUserId = admin.id;
    }
  });

  test('1. Admin can create a product with type, sales price, cost price, and notes', async () => {
    const code = `PROD-${Date.now()}`;
    const product = await productService.createProduct(
      {
        name: 'Brightloop CRM Suite',
        code,
        type: 'Software',
        salesPrice: 5000,
        costPrice: 2200,
        notes: 'Enterprise CRM core module for small business',
        description: 'Comprehensive business relationship management',
        category: 'Business Application',
        status: 'ACTIVE',
      },
      adminUserId
    );

    assert.ok(product.id, 'Product ID should be generated');
    assert.strictEqual(product.code, code);
    assert.strictEqual(product.type, 'Software');
    assert.strictEqual(Number(product.salesPrice), 5000);
    assert.strictEqual(Number(product.costPrice), 2200);
    assert.strictEqual(product.notes, 'Enterprise CRM core module for small business');
    assert.strictEqual(product.status, 'ACTIVE');
    testProductId = product.id;
  });

  test('2. Rejects duplicate product code with 409 conflict', async () => {
    const product = await prisma.product.findUnique({ where: { id: testProductId } });
    assert.ok(product);

    await assert.rejects(
      async () => {
        await productService.createProduct(
          {
            name: 'Duplicate SKU Product',
            code: product.code,
            type: 'Software',
            salesPrice: 5000,
            costPrice: 2000,
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

  test('3. Cost price is strictly redacted from customer responses and visible to admin/staff', async () => {
    const adminView = await productService.getProductById(testProductId, Role.ADMIN);
    assert.strictEqual(Number(adminView.costPrice), 2200, 'Admin can view internal cost price');

    const staffView = await productService.getProductById(testProductId, Role.STAFF);
    assert.strictEqual(Number(staffView.costPrice), 2200, 'Staff can view internal cost price');

    const customerView = await productService.getProductById(testProductId, Role.CUSTOMER);
    assert.strictEqual(
      (customerView as any).costPrice,
      undefined,
      'Cost price must be redacted from customer view'
    );
  });

  test('4. Admin can update product details, notes, and toggle status', async () => {
    const updated = await productService.updateProduct(
      testProductId,
      {
        name: 'Brightloop CRM Suite v2',
        salesPrice: 5500,
        costPrice: 2400,
        notes: 'Updated notes with enhanced discount schedules',
      },
      adminUserId
    );

    assert.strictEqual(updated.name, 'Brightloop CRM Suite v2');
    assert.strictEqual(Number(updated.salesPrice), 5500);

    const deactivated = await productService.updateProductStatus(testProductId, 'INACTIVE', adminUserId);
    assert.strictEqual(deactivated.status, 'INACTIVE');

    const reactivated = await productService.updateProductStatus(testProductId, 'ACTIVE', adminUserId);
    assert.strictEqual(reactivated.status, 'ACTIVE');
  });
});

describe('Product Variants & Dynamic Additional Pricing Tests', async () => {
  let adminUserId: string;
  let softwareProductId: string;
  let standardVariantId: string;
  let odooVariantId: string;
  let premiumVariantId: string;
  let inactiveVariantId: string;

  before(async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@brightloop.io' } });
    if (admin) adminUserId = admin.id;

    const baseProduct = await productService.createProduct(
      {
        name: 'Software Subscription',
        code: `SW-SUB-${Date.now()}`,
        type: 'Software',
        salesPrice: 5000,
        costPrice: 2000,
        status: 'ACTIVE',
      },
      adminUserId
    );
    softwareProductId = baseProduct.id;
  });

  test('1. Can add dynamic variants with additional price and custom attributes', async () => {
    // 1. Standard variant (₹0 additional)
    const standard = await productService.createVariant(
      softwareProductId,
      {
        name: 'Standard',
        code: `VAR-STD-${Date.now()}`,
        additionalPrice: 0,
        price: 5000,
        attributes: { tier: 'Standard', brand: 'Generic' },
        status: 'ACTIVE',
      },
      adminUserId
    );
    standardVariantId = standard.id;
    assert.strictEqual(Number(standard.additionalPrice), 0);

    // 2. Odoo variant (₹560 additional)
    const odoo = await productService.createVariant(
      softwareProductId,
      {
        name: 'Odoo',
        code: `VAR-ODOO-${Date.now()}`,
        additionalPrice: 560,
        price: 5560,
        attributes: { tier: 'Integrated', brand: 'Odoo' },
        status: 'ACTIVE',
      },
      adminUserId
    );
    odooVariantId = odoo.id;
    assert.strictEqual(Number(odoo.additionalPrice), 560);

    // 3. Premium variant (₹1000 additional)
    const premium = await productService.createVariant(
      softwareProductId,
      {
        name: 'Premium',
        code: `VAR-PREM-${Date.now()}`,
        additionalPrice: 1000,
        price: 6000,
        attributes: { tier: 'Premium', brand: 'Brightloop Elite' },
        status: 'ACTIVE',
      },
      adminUserId
    );
    premiumVariantId = premium.id;
    assert.strictEqual(Number(premium.additionalPrice), 1000);

    // 4. Inactive variant
    const inactive = await productService.createVariant(
      softwareProductId,
      {
        name: 'Deprecated Beta Variant',
        code: `VAR-INACT-${Date.now()}`,
        additionalPrice: 100,
        status: 'INACTIVE',
      },
      adminUserId
    );
    inactiveVariantId = inactive.id;
    assert.strictEqual(inactive.status, 'INACTIVE');
  });

  test('2. Final price calculation matches: Base (₹5,000) + Odoo Variant (₹560) = ₹5,560', async () => {
    const enriched = await productService.getProductById(softwareProductId);
    const odooVariant = enriched.variants.find((v) => v.id === odooVariantId);
    assert.ok(odooVariant);

    const calculatedPrice = productService.calculateFinalPrice(
      Number(enriched.salesPrice),
      Number(odooVariant.additionalPrice)
    );
    assert.strictEqual(calculatedPrice, 5560, '5000 + 560 must equal 5560');
  });

  test('3. Inactive variants are rejected when attempting to create a new plan', async () => {
    await assert.rejects(
      async () => {
        await planService.createPlan(
          {
            name: 'Plan on Inactive Variant',
            code: `PLN-FAIL-INACT-${Date.now()}`,
            productId: softwareProductId,
            variantId: inactiveVariantId,
            price: 5100,
            billingFrequency: 'MONTHLY',
            status: 'ACTIVE',
          },
          adminUserId
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 400);
        assert.match(err.message, /inactive variants cannot be selected/i);
        return true;
      }
    );
  });
});

describe('Plan Management & Configurable Lifecycle Tests', async () => {
  let adminUserId: string;
  let productId: string;
  let odooVariantId: string;
  let foreignProductId: string;
  let foreignVariantId: string;

  before(async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@brightloop.io' } });
    if (admin) adminUserId = admin.id;

    const p1Code = `PLAN-TEST-P1-${Date.now()}`;
    const p1 = await productService.createProduct({
      name: 'Software Suite Pro',
      code: p1Code,
      type: 'Software',
      salesPrice: 5000,
      costPrice: 2000,
      status: 'ACTIVE',
      variants: [
        {
          name: 'Odoo Edition',
          code: `${p1Code}-ODOO`,
          additionalPrice: 560,
          price: 5560,
          status: 'ACTIVE',
        },
      ],
    });
    productId = p1.id;
    odooVariantId = p1.variants[0].id;

    const p2Code = `PLAN-TEST-P2-${Date.now()}`;
    const p2 = await productService.createProduct({
      name: 'Hardware Hub',
      code: p2Code,
      type: 'Hardware',
      salesPrice: 12000,
      costPrice: 8000,
      status: 'ACTIVE',
      variants: [
        {
          name: 'Default Variant',
          code: `${p2Code}-DEF`,
          additionalPrice: 0,
          status: 'ACTIVE',
        },
      ],
    });
    foreignProductId = p2.id;
    foreignVariantId = p2.variants[0].id;
  });

  test('1. Admin can create a plan with Odoo variant, daily/weekly/monthly/yearly frequency, minQuantity, and dates', async () => {
    const planCode = `PLN-ODOO-${Date.now()}`;
    const startDate = new Date();
    const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const plan = await planService.createPlan(
      {
        name: 'Odoo Cloud Monthly Professional',
        code: planCode,
        description: 'Full ERP sync with automated nightly reconciliations',
        productId,
        variantId: odooVariantId,
        price: 5560,
        billingFrequency: 'MONTHLY',
        minQuantity: 5,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        autoCloseOnEnd: true,
        allowEarlyClosure: true,
        allowPause: false,
        allowRenewal: true,
        status: 'ACTIVE',
      },
      adminUserId
    );

    assert.ok(plan.id);
    assert.strictEqual(plan.code, planCode);
    assert.strictEqual(plan.billingFrequency, 'MONTHLY');
    assert.strictEqual(Number(plan.price), 5560);
    assert.strictEqual(plan.minQuantity, 5);
    assert.strictEqual(plan.autoCloseOnEnd, true);
    assert.strictEqual(plan.allowEarlyClosure, true);
    assert.strictEqual(plan.allowPause, false);
    assert.strictEqual(plan.allowRenewal, true);

    // Verify transparent pricing breakdown
    assert.ok(plan.pricingBreakdown);
    assert.strictEqual(plan.pricingBreakdown.baseSalesPrice, 5000);
    assert.strictEqual(plan.pricingBreakdown.variantAdditionalPrice, 560);
    assert.strictEqual(plan.pricingBreakdown.calculatedProductPrice, 5560);
    assert.strictEqual(plan.pricingBreakdown.planPrice, 5560);
  });

  test('2. Independent lifecycle control: Plan B with inverted lifecycle flags', async () => {
    const planCode = `PLN-FLEX-${Date.now()}`;
    const plan = await planService.createPlan(
      {
        name: 'Flexible Daily Sandbox',
        code: planCode,
        productId,
        price: 250,
        billingFrequency: 'DAILY',
        minQuantity: 1,
        autoCloseOnEnd: false,
        allowEarlyClosure: false,
        allowPause: true,
        allowRenewal: false,
        status: 'ACTIVE',
      },
      adminUserId
    );

    assert.strictEqual(plan.billingFrequency, 'DAILY');
    assert.strictEqual(plan.autoCloseOnEnd, false);
    assert.strictEqual(plan.allowEarlyClosure, false);
    assert.strictEqual(plan.allowPause, true);
    assert.strictEqual(plan.allowRenewal, false);
  });

  test('3. Rejects plan when availability endDate is earlier than startDate', async () => {
    const start = new Date('2026-06-01');
    const end = new Date('2026-05-01'); // Earlier than start!

    await assert.rejects(
      async () => {
        await planService.createPlan(
          {
            name: 'Invalid Date Plan',
            code: `PLN-ERR-DATE-${Date.now()}`,
            productId,
            price: 1000,
            billingFrequency: 'YEARLY',
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            status: 'ACTIVE',
          },
          adminUserId
        );
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 400);
        assert.match(err.message, /earlier than start date/i);
        return true;
      }
    );
  });

  test('4. Rejects plan creation if variant does not belong to specified product', async () => {
    await assert.rejects(
      async () => {
        await planService.createPlan(
          {
            name: 'Cross Product Plan',
            code: `PLN-CROSS-${Date.now()}`,
            productId, // Product A
            variantId: foreignVariantId, // Variant from Product B
            price: 5000,
            billingFrequency: 'WEEKLY',
            status: 'ACTIVE',
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

  test('5. Rejects plan creation for INACTIVE products', async () => {
    const inactiveProd = await productService.createProduct({
      name: 'Decommissioned Software',
      code: `INACT-${Date.now()}`,
      salesPrice: 1000,
      costPrice: 500,
      status: 'INACTIVE',
    });

    await assert.rejects(
      async () => {
        await planService.createPlan(
          {
            name: 'Plan on Inactive Product',
            code: `PLN-FAIL-${Date.now()}`,
            productId: inactiveProd.id,
            price: 1000,
            billingFrequency: 'MONTHLY',
            status: 'ACTIVE',
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

  test('6. Supports all requested billing cadences: DAILY, WEEKLY, MONTHLY, YEARLY', async () => {
    for (const freq of ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const) {
      const code = `CAD-${freq}-${Date.now()}`;
      const plan = await planService.createPlan(
        {
          name: `Cadence Plan ${freq}`,
          code,
          productId,
          price: 1500,
          billingFrequency: freq,
          status: 'ACTIVE',
        },
        adminUserId
      );

      assert.strictEqual(plan.billingFrequency, freq);
    }
  });
});
