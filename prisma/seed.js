const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@cashup.com' },
    update: {},
    create: {
      email: 'demo@cashup.com',
      passwordHash: hash,
      firstName: 'Demo',
      lastName: 'Usuario',
      documentId: '12345678',
      monthlyIncome: 3500,
    },
  });
  await prisma.creditProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, creditScore: 65 },
  });
  console.log('Seed: usuario demo@cashup.com / password123 creado');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
