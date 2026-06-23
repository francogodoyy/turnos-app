import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sembrando datos demo...");

  const demoPassword = await hash("demo123", 12);

  const demoProfessional = await prisma.user.upsert({
    where: { email: "demo@turnos.com" },
    update: {},
    create: {
      name: "Dr. Martín López",
      email: "demo@turnos.com",
      password: demoPassword,
      role: "PROFESSIONAL" as Role,
      timezone: "America/Argentina/Buenos_Aires",
    },
  });

  const prof = await prisma.professional.upsert({
    where: { userId: demoProfessional.id },
    update: {},
      create: {
        userId: demoProfessional.id,
        phone: "+54 11 5555-0123",
        specialty: "Odontólogo",
        description: "Odontólogo general - Especialista en ortodoncia",
      address: "Av. Corrientes 1234, CABA",
      duration: 30,
    },
  });

  const demoClient = await prisma.user.upsert({
    where: { email: "cliente@demo.com" },
    update: {},
    create: {
      name: "Ana García",
      email: "cliente@demo.com",
      password: demoPassword,
      role: "CLIENT" as Role,
    },
  });

  const days = [1, 2, 3, 4, 5];
  for (const day of days) {
    await prisma.availability.createMany({
      data: [
        { professionalId: prof.id, dayOfWeek: day, startTime: "09:00", endTime: "13:00" },
        { professionalId: prof.id, dayOfWeek: day, startTime: "14:00", endTime: "18:00" },
      ],
      skipDuplicates: true,
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const pastAppt = new Date(yesterday);
  pastAppt.setHours(10, 0, 0, 0);

  const todayAppt = new Date(today);
  todayAppt.setHours(11, 0, 0, 0);

  const todayAppt2 = new Date(today);
  todayAppt2.setHours(15, 30, 0, 0);

  const tomorrowAppt = new Date(tomorrow);
  tomorrowAppt.setHours(9, 0, 0, 0);

  await prisma.appointment.createMany({
    data: [
      { clientId: demoClient.id, professionalId: prof.id, date: pastAppt, duration: 30, status: "COMPLETED" },
      { clientId: demoClient.id, professionalId: prof.id, date: todayAppt, duration: 30, status: "CONFIRMED" },
      { clientId: demoClient.id, professionalId: prof.id, date: todayAppt2, duration: 30, status: "PENDING", notes: "Consulta por dolor de muela" },
      { clientId: demoClient.id, professionalId: prof.id, date: tomorrowAppt, duration: 30, status: "PENDING" },
    ],
    skipDuplicates: true,
  });

  const demoAdmin = await prisma.user.upsert({
    where: { email: "admin@turnos.com" },
    update: {},
    create: {
      name: "Admin Agendalo",
      email: "admin@turnos.com",
      password: demoPassword,
      role: "ADMIN" as Role,
    },
  });

  console.log("✅ Seed completado!");
  console.log("   Profesional:  demo@turnos.com / demo123");
  console.log("   Cliente:      cliente@demo.com / demo123");
  console.log("   Admin:        admin@turnos.com / demo123");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
