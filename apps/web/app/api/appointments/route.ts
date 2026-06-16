import { prisma } from "@turnos/db";
import { auth } from "@/auth";
import { CreateAppointmentSchema } from "@turnos/shared";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });

  const where = professional
    ? { professionalId: professional.id }
    : { clientId: session.user.id };

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      client: { select: { name: true, email: true } },
      professional: { include: { user: { select: { name: true } } } },
    },
    orderBy: { date: "desc" },
  });

  return Response.json(appointments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const professional = await prisma.professional.findUnique({
    where: { id: parsed.data.professionalId },
  });

  if (!professional) {
    return Response.json({ error: "Profesional no encontrado" }, { status: 404 });
  }

  const appointmentDate = new Date(parsed.data.date);
  const endDate = new Date(appointmentDate);
  endDate.setMinutes(endDate.getMinutes() + professional.duration);

  const existingClient = await prisma.appointment.findFirst({
    where: {
      clientId: session.user.id,
      professionalId: parsed.data.professionalId,
      date: { gte: new Date() },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  if (existingClient) {
    return Response.json(
      { error: "Ya tenés un turno pendiente con este profesional" },
      { status: 409 }
    );
  }

  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      professionalId: parsed.data.professionalId,
      status: { in: ["PENDING", "CONFIRMED"] },
      date: {
        gte: appointmentDate,
        lt: endDate,
      },
    },
  });

  if (conflictingAppointment) {
    return Response.json(
      { error: "Ese horario ya está ocupado" },
      { status: 409 }
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      clientId: session.user.id,
      professionalId: parsed.data.professionalId,
      date: appointmentDate,
      duration: professional.duration,
      notes: parsed.data.notes,
    },
  });

  return Response.json(appointment, { status: 201 });
}
