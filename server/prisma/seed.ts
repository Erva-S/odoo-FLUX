import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Subscriptly Phase 1 database...');

  // 1. Admin User
  const adminPasswordHash = await bcrypt.hash('Admin@Brightloop123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@brightloop.io' },
    update: {},
    create: {
      name: 'Arun Nair',
      email: 'admin@brightloop.io',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`✅ Admin user ready: ${admin.email}`);

  // 2. Staff User
  const staffPasswordHash = await bcrypt.hash('Staff@Brightloop123!', 12);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@brightloop.io' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'staff@brightloop.io',
      passwordHash: staffPasswordHash,
      role: Role.STAFF,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`✅ Staff user ready: ${staff.email}`);

  // 3. Customer User
  const customerPasswordHash = await bcrypt.hash('Customer@Brightloop123!', 12);
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@brightloop.io' },
    update: {},
    create: {
      name: 'Rahul Verma',
      email: 'customer@brightloop.io',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      isActive: true,
      emailVerified: true,
      customer: {
        create: {
          companyName: 'Acme SaaS Innovations Ltd',
          contactNumber: '+91 98765 43210',
          billingAddress: '42 Cyber City, Outer Ring Road, Bangalore - 560103',
        },
      },
    },
    include: {
      customer: true,
    },
  });
  console.log(`✅ Customer user ready: ${customerUser.email}`);

  // 4. Initial Products & Variants (Phase 2)
  console.log('📦 Seeding Phase 2 Products, Variants, and Subscription Plans...');
  const prod1 = await prisma.product.upsert({
    where: { code: 'SUB-CORE-001' },
    update: {},
    create: {
      name: 'Subscriptly Enterprise Engine',
      code: 'SUB-CORE-001',
      description: 'Complete recurring billing and dunning management engine with enterprise SLA.',
      category: 'Core SaaS',
      status: 'ACTIVE',
      variants: {
        create: [
          {
            name: 'Starter Tier (Up to 1,000 Accounts)',
            code: 'SUB-CORE-001-ST',
            description: 'Entry-level subscription engine with automated billing runs.',
            price: 14999.00,
            status: 'ACTIVE',
          },
          {
            name: 'Professional Tier (Up to 10,000 Accounts)',
            code: 'SUB-CORE-001-PR',
            description: 'Advanced automated dunning, webhooks, and multi-currency billing.',
            price: 49999.00,
            status: 'ACTIVE',
          },
          {
            name: 'Enterprise Apex (Unlimited Accounts)',
            code: 'SUB-CORE-001-AP',
            description: 'Custom dunning cascades, dedicated infrastructure, and 24/7 SLA.',
            price: 145000.00,
            status: 'ACTIVE',
          },
        ],
      },
    },
    include: { variants: true },
  });

  const prod2 = await prisma.product.upsert({
    where: { code: 'SUB-ANL-002' },
    update: {},
    create: {
      name: 'Real-time FinOps Telemetry',
      code: 'SUB-ANL-002',
      description: 'Live cohort retention, MRR forecasts, and automated tax accounting analytics.',
      category: 'Add-on',
      status: 'ACTIVE',
      variants: {
        create: [
          {
            name: 'Standard Telemetry',
            code: 'SUB-ANL-002-STD',
            description: 'Core revenue reports, MRR charts, and churn alerts.',
            price: 8500.00,
            status: 'ACTIVE',
          },
        ],
      },
    },
    include: { variants: true },
  });

  const prod3 = await prisma.product.upsert({
    where: { code: 'SUB-GST-003' },
    update: {},
    create: {
      name: 'India GST & e-Invoice Connector',
      code: 'SUB-GST-003',
      description: 'Direct NIC / GSTN government portal bridge with instant IRN & QR generation.',
      category: 'Connector',
      status: 'ACTIVE',
    },
  });

  // 5. Subscription Plans
  const starterVariant = prod1.variants.find((v) => v.code === 'SUB-CORE-001-ST');
  const proVariant = prod1.variants.find((v) => v.code === 'SUB-CORE-001-PR');
  const apexVariant = prod1.variants.find((v) => v.code === 'SUB-CORE-001-AP');

  await prisma.plan.upsert({
    where: { code: 'PLN-START-M' },
    update: {},
    create: {
      productId: prod1.id,
      variantId: starterVariant?.id,
      name: 'Growth Starter Monthly',
      code: 'PLN-START-M',
      description: 'Ideal for emerging startups needing automated invoice runs.',
      price: 14999.00,
      billingFrequency: 'MONTHLY',
      status: 'ACTIVE',
      pauseLimitCycles: 1,
      cancellationNoticeDays: 14,
      trialPeriodDays: 14,
      features: [
        'Up to 1,000 active subscribers',
        'Automated GST e-invoices',
        'Standard email dunning',
        'Community support SLA',
      ],
    },
  });

  await prisma.plan.upsert({
    where: { code: 'PLN-START-Y' },
    update: {},
    create: {
      productId: prod1.id,
      variantId: starterVariant?.id,
      name: 'Growth Starter Annual',
      code: 'PLN-START-Y',
      description: 'Annual plan with 2 months free discount included.',
      price: 149990.00,
      billingFrequency: 'YEARLY',
      status: 'ACTIVE',
      pauseLimitCycles: 2,
      cancellationNoticeDays: 30,
      trialPeriodDays: 14,
      features: [
        'Up to 1,000 active subscribers',
        'Automated GST e-invoices',
        'Annual prepayment discount',
        'Priority email support',
      ],
    },
  });

  await prisma.plan.upsert({
    where: { code: 'PLN-PRO-M' },
    update: {},
    create: {
      productId: prod1.id,
      variantId: proVariant?.id,
      name: 'Professional Scale Monthly',
      code: 'PLN-PRO-M',
      description: 'Comprehensive subscription scaling for growth SaaS teams.',
      price: 49999.00,
      billingFrequency: 'MONTHLY',
      status: 'ACTIVE',
      pauseLimitCycles: 2,
      cancellationNoticeDays: 30,
      trialPeriodDays: 30,
      features: [
        'Up to 10,000 active subscribers',
        'NPCI AutoPay & e-Mandate fallback',
        'Multi-currency billing (INR, USD)',
        'FinOps cohort analytics',
        '24/7 Priority support SLA',
      ],
    },
  });

  await prisma.plan.upsert({
    where: { code: 'PLN-ENT-APEX' },
    update: {},
    create: {
      productId: prod1.id,
      variantId: apexVariant?.id,
      name: 'Enterprise Apex Dedicated',
      code: 'PLN-ENT-APEX',
      description: 'Tailored enterprise subscription management with bespoke integrations.',
      price: 145000.00,
      billingFrequency: 'MONTHLY',
      status: 'ACTIVE',
      pauseLimitCycles: 3,
      cancellationNoticeDays: 60,
      trialPeriodDays: 30,
      features: [
        'Unlimited subscription portfolios',
        'Dedicated NIC GST e-Invoice Gateway',
        'Custom webhook triggers & event streams',
        'Designated enterprise account manager',
      ],
    },
  });

  await prisma.plan.upsert({
    where: { code: 'PLN-GST-BRIDGE' },
    update: {},
    create: {
      productId: prod3.id,
      name: 'NIC GST e-Invoice Direct Gateway',
      code: 'PLN-GST-BRIDGE',
      description: 'Government compliance connector for live B2B IRN generation.',
      price: 24000.00,
      billingFrequency: 'YEARLY',
      status: 'ACTIVE',
      pauseLimitCycles: 0,
      cancellationNoticeDays: 30,
      features: ['Direct NIC government token access', 'Instant PDF QR stamping', 'Audit trail export'],
    },
  });

  // 6. Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'SYSTEM_INITIALIZATION',
        entityType: 'System',
        entityId: 'Phase1',
        metadata: { message: 'Database initialized with Phase 1 baseline schema' },
      },
      {
        userId: admin.id,
        action: 'STAFF_ACCOUNT_PROVISIONED',
        entityType: 'User',
        entityId: staff.id,
        metadata: { staffEmail: staff.email },
      },
      {
        userId: customerUser.id,
        action: 'CUSTOMER_PORTAL_ACTIVATED',
        entityType: 'Customer',
        entityId: customerUser.customer?.id,
        metadata: { companyName: customerUser.customer?.companyName },
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
