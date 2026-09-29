const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const ownerPassword = await bcrypt.hash('Owner@12345', 10);
  const userPassword = await bcrypt.hash('User@12345', 10);

  // 1. System Admin (Name length 20-60 requirement)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@storerating.com' },
    update: {},
    create: {
      name: 'System Administrator Super',
      email: 'admin@storerating.com',
      password: adminPassword,
      address: 'Central Admin Headquarters, Suite 100, City Center',
      role: 'ADMIN'
    }
  });

  // 2. Store Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@storerating.com' },
    update: {},
    create: {
      name: 'Store Owner Representative',
      email: 'owner@storerating.com',
      password: ownerPassword,
      address: 'Market Street Commercial Complex, Block B',
      role: 'STORE_OWNER'
    }
  });

  // 3. Normal User
  await prisma.user.upsert({
    where: { email: 'user@storerating.com' },
    update: {},
    create: {
      name: 'Regular Platform Customer',
      email: 'user@storerating.com',
      password: userPassword,
      address: '221B Baker Street Residential Apartment, Floor 4',
      role: 'NORMAL_USER'
    }
  });

  // 4. Sample Store
  await prisma.store.upsert({
    where: { email: 'store1@storerating.com' },
    update: {},
    create: {
      name: 'Downtown Supermarket Express',
      email: 'store1@storerating.com',
      address: '100 Main Street, Downtown Center',
      ownerId: owner.id
    }
  });

  console.log('Database seeded successfully with default Admin, Owner, User, and Store.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });