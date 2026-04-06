import { PrismaClient, SourceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 10 test leads mixing different sources and budgets
  const leadsData = [
    { nombre: 'Juan Perez', email: 'juan.perez@example.com', telefono: '+1234567890', fuente: SourceType.instagram, producto_interes: 'SAAS Premium', presupuesto: 1500.00 },
    { nombre: 'Maria Gomez', email: 'maria.gomez@example.com', fuente: SourceType.facebook, producto_interes: 'Consultoría', presupuesto: 800.00 },
    { nombre: 'Carlos Ruiz', email: 'carlos.ruiz@example.com', telefono: '+0987654321', fuente: SourceType.landing_page, producto_interes: 'Curso Avanzado' },
    { nombre: 'Ana Martinez', email: 'ana.martinez@example.com', fuente: SourceType.referido, presupuesto: 2500.00 },
    { nombre: 'Luis Fernandez', email: 'luis.fernandez@example.com', telefono: '+1122334455', fuente: SourceType.otro, producto_interes: 'Plan Básico', presupuesto: 100.00 },
    { nombre: 'Laura Torres', email: 'laura.torres@example.com', fuente: SourceType.instagram, producto_interes: 'SAAS Pro', presupuesto: 2000.00 },
    { nombre: 'Diego Castro', email: 'diego.castro@example.com', telefono: '+5544332211', fuente: SourceType.landing_page, presupuesto: 300.00 },
    { nombre: 'Sofia Ramirez', email: 'sofia.ramirez@example.com', fuente: SourceType.facebook, producto_interes: 'Pack Completo', presupuesto: 5000.00 },
    { nombre: 'Pedro Morales', email: 'pedro.morales@example.com', telefono: '+6677889900', fuente: SourceType.referido, producto_interes: 'Auditoría', presupuesto: 1200.00 },
    { nombre: 'Elena Vega', email: 'elena.vega@example.com', fuente: SourceType.otro, producto_interes: 'Licencia Anual', presupuesto: 850.00 },
  ];

  for (const lead of leadsData) {
    const existing = await prisma.lead.findUnique({ where: { email: lead.email } });
    if (!existing) {
      await prisma.lead.create({ data: lead });
    }
  }

  // Create an initial admin user
  const adminEmail = 'admin@one-million.com';
  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingUser) {
    // Note: In a real project, we should hash this password with bcrypt
    // Since Auth is required, we provide a placeholder hashed password or plain if we bcrypt later. Let's use a dummy hashed string or will do it in AuthModule. 
    // We'll leave it as test1234 since this is a seed. AuthModule validateUser should use bcrypt compare if we hash.
    // For simplicity of not adding bcrypt dependency unless requested, wait, a simple auth is required.
    // I can install bcrypt or use a dummy. The specs don't explicitly require bcrypt, but standard is bcrypt. Let's use it as simple text for now or bcrypt later.
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: 'hashed_password_placeholder', // Should be replaced with proper bcrypt hash if validating logins
      }
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
