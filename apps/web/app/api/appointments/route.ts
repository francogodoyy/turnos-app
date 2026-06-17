import { prisma } from "@turnos/db";
import { auth } from "@/auth";
import { CreateAppointmentSchema, TZ_ARGENTINA } from "@turnos/shared";
import { sendConfirmation } from "@/lib/email";

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
    include: { user: { select: { name: true } } },
  });

  if (!professional) {
    return Response.json({ error: "Profesional no encontrado" }, { status: 404 });
  }

  const appointmentDate = new Date(parsed.data.date);
  const endDate = new Date(appointmentDate);
  endDate.setMinutes(endDate.getMinutes() + professional.duration);

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

  sendConfirmation({
    email: session.user.email!,
    clientName: session.user.name!,
    professionalName: professional.user?.name ?? "Profesional",
    specialty: professional.specialty,
    date: appointmentDate.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: TZ_ARGENTINA,
    }),
    time: appointmentDate.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: TZ_ARGENTINA,
    }),
    duration: professional.duration,
  }).catch(() => {});

  return Response.json(appointment, { status: 201 });
}
