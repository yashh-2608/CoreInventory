import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // Demo User (for the "View Dashboard Demo" button)
  // Categories and products are intentionally NOT seeded — each user creates their own.
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
