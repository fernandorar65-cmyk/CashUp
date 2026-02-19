const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // 1. Roles
  const roles = [
    { name: 'ADMIN', description: 'Administrador del sistema' },
    { name: 'ANALYST', description: 'Analista crediticio' },
    { name: 'COLLECTOR', description: 'Cobrador' },
  ];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }
  console.log('Roles creados: ADMIN, ANALYST, COLLECTOR');

  // 2. Política de mora por defecto (solo una con isDefault = true)
  let defaultPolicy = await prisma.penaltyPolicy.findFirst({ where: { isDefault: true } });
  if (!defaultPolicy) {
    defaultPolicy = await prisma.penaltyPolicy.create({
      data: {
        name: 'Mora estándar 1%',
        rate: 0.01,
        graceDays: 5,
        calculationType: 'PERCENTAGE_ON_BALANCE',
        isDefault: true,
      },
    });
  }
  console.log('Política de mora por defecto:', defaultPolicy.name);

  // 3. Usuario admin (staff)
  const hash = await bcrypt.hash('password123', 10);
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cashup.com' },
    update: {},
    create: {
      email: 'admin@cashup.com',
      passwordHash: hash,
      firstName: 'Admin',
      lastName: 'CashUp',
      status: 'ACTIVE',
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });
  console.log('Usuario admin creado: admin@cashup.com / password123');

  // 4. Cliente de prueba (opcional)
  const client = await prisma.client.upsert({
    where: { documentId: '12345678' },
    update: {},
    create: {
      documentId: '12345678',
      documentType: 'DNI',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@example.com',
      phone: '+51987654321',
      monthlyIncome: 3500,
      status: 'ACTIVE',
    },
  });
  await prisma.clientCreditProfile.upsert({
    where: { clientId: client.id },
    update: {},
    create: {
      clientId: client.id,
      creditScore: 65,
      riskLevel: 'MEDIUM',
      onTimePayments: 0,
      latePayments: 0,
    },
  });
  console.log('Cliente de prueba creado: documentId 12345678, email juan.perez@example.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
