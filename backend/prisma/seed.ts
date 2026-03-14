import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // 1. Categories
  const categories = [
    { name: 'Electronics' },
    { name: 'Apparel' },
    { name: 'Home & Kitchen' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  // 2. Warehouses
  const warehouses = [
    { name: 'London East Hub', location: 'London, UK', capacity: 5000 },
    { name: 'Manchester North Depot', location: 'Manchester, UK', capacity: 3000 },
    { name: 'Birmingham Central', location: 'Birmingham, UK', capacity: 4000 },
  ];

  for (const war of warehouses) {
    await prisma.warehouse.upsert({
      where: { name: war.name },
      update: {},
      create: war,
    });
  }

  // 3. Demo User
  const hashedPassword = await bcrypt.hash('demo123', 10);
  await prisma.user.upsert({
    where: { email: 'demo@coreinventory.com' },
    update: {},
    create: {
      email: 'demo@coreinventory.com',
      password: hashedPassword,
      name: 'Demo Account',
      role: 'ADMIN',
    },
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
