import { PrismaClient, Role } from '../generated/prisma/client.js';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Phase 9A Super Admin foundation...\n');

  // ── Seed Platform Plans ──
  const plans = [
    {
      name: 'Starter',
      description: 'Basic plan for small gyms',
      price: 999.00,
      billingCycle: 'monthly',
      features: JSON.stringify([
        'Up to 100 members',
        'Basic attendance tracking',
        'Standard reports',
        'Email support',
      ]),
    },
    {
      name: 'Growth',
      description: 'Advanced plan for growing gyms',
      price: 1999.00,
      billingCycle: 'monthly',
      features: JSON.stringify([
        'Up to 500 members',
        'Advanced attendance & QR check-in',
        'Revenue analytics',
        'WhatsApp notifications',
        'Razorpay integration',
        'Priority support',
      ]),
    },
    {
      name: 'Enterprise',
      description: 'Full-featured plan for large chains',
      price: 4999.00,
      billingCycle: 'monthly',
      features: JSON.stringify([
        'Unlimited members',
        'Multi-location support',
        'Custom integrations',
        'Advanced CRM & marketing',
        'Dedicated account manager',
        '24/7 phone support',
      ]),
    },
  ];

  for (const plan of plans) {
    const existingPlan = await prisma.platformPlan.findFirst({
      where: { name: plan.name },
    });

    if (!existingPlan) {
      await prisma.platformPlan.create({ data: plan });
      console.log(`✅ PlatformPlan seeded: ${plan.name}`);
    } else {
      console.log(`⏭️ PlatformPlan already exists: ${plan.name}`);
    }
  }

  // ── Seed SUPER_ADMIN (platform-level user, no tenant) ──
  // Use environment variables for credentials so passwords are not hardcoded.
  // Set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD in your environment before running the seed.
  // If a SUPER_ADMIN already exists with the given email, the seed is idempotent and will skip creation.
  const superAdminEmail = process.env.SUPERADMIN_EMAIL;
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD;

  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      email: superAdminEmail,
      tenantId: null,
      deletedAt: null,
    },
  });

  if (existingSuperAdmin) {
    console.log(`⏭️ SUPER_ADMIN already exists: ${existingSuperAdmin.email} (${existingSuperAdmin.id})`);
  } else {
    if (!superAdminEmail || !superAdminPassword) {
      throw new Error(
        'SUPER_ADMIN does not exist. Set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD to create the account securely.',
      );
    }

    const passwordHash = await bcrypt.hash(superAdminPassword, 12);

    const superAdmin = await prisma.user.create({
      data: {
        firstName: 'Super',
        lastName: 'Admin',
        email: superAdminEmail,
        passwordHash,
        role: Role.SUPER_ADMIN,
        // tenantId intentionally omitted — SUPER_ADMIN has no tenant
      },
    });

    console.log(`✅ SUPER_ADMIN seeded: ${superAdmin.email} (${superAdmin.id})`);
  }

  // ── Seed a demo Tenant + Owner (development only) ──
  if (process.env.NODE_ENV !== 'production') {
    const demoTenant = await prisma.tenant.upsert({
      where: { email: 'demo@ironforge-gym.com' },
      update: {},
      create: {
        name: 'Iron Forge Gym',
        email: 'demo@ironforge-gym.com',
        phone: '+91-9876543210',
        address: '42 Fitness Lane, Sector 18, Noida, UP 201301',
      },
    });

    console.log(`✅ Demo Tenant seeded: ${demoTenant.name} (${demoTenant.id})`);

    const demoOwnerEmail = 'owner@ironforge-gym.com';
    const demoOwnerPassword = process.env.DEMO_OWNER_PASSWORD;

    const existingDemoOwner = await prisma.user.findFirst({
      where: {
        tenantId: demoTenant.id,
        email: demoOwnerEmail,
        deletedAt: null,
      },
    });

    if (existingDemoOwner) {
      console.log(`⏭️ Demo Owner already exists: ${existingDemoOwner.email} (${existingDemoOwner.id})`);
    } else if (!demoOwnerPassword) {
      console.log(
        '⏭️ Demo Owner skipped: DEMO_OWNER_PASSWORD is not set. Set it to create the demo owner account.',
      );
    } else {
      const ownerHash = await bcrypt.hash(demoOwnerPassword, 12);

      const owner = await prisma.user.create({
        data: {
          tenantId: demoTenant.id,
          firstName: 'Rahul',
          lastName: 'Sharma',
          email: demoOwnerEmail,
          passwordHash: ownerHash,
          role: Role.OWNER,
        },
      });

      console.log(`✅ Demo Owner seeded: ${owner.firstName} ${owner.lastName} (${owner.id})`);
    }
  }

  console.log('\n🎉 Phase 0 seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
