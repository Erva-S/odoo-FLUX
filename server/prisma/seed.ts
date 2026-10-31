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

  // 4. Initial Audit Logs
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
