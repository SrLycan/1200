import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Autos Quito CRM...');

  // ---------- Pipeline stages ----------
  const stages = [
    { slug: 'new', name: 'Lead nuevo', order: 1, color: '#3b82f6' },
    { slug: 'triage', name: 'En triaje', order: 2, color: '#8b5cf6' },
    { slug: 'qualified', name: 'Lead calificado', order: 3, color: '#06b6d4' },
    { slug: 'appointment', name: 'Cita agendada', order: 4, color: '#f59e0b' },
    { slug: 'negotiation', name: 'Negociación', order: 5, color: '#f97316' },
    { slug: 'won', name: 'Venta cerrada', order: 6, color: '#10b981', isWon: true },
    { slug: 'lost', name: 'Lead perdido', order: 7, color: '#ef4444', isLost: true },
  ];

  for (const s of stages) {
    await prisma.pipelineStage.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }

  // ---------- Admin user ----------
  const adminEmail = 'admin@autosquito.com';
  const passwordHash = await argon2.hash('Admin12345!');

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.ADMIN,
    },
  });

  console.log(`Admin: ${adminEmail} / Admin12345!`);
  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
