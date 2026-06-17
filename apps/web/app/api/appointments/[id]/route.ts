import { prisma } from "@turnos/db";
import { auth } from "@/auth";
import { TZ_ARGENTINA } from "@turnos/shared";
import { sendConfirmation } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  const validStatuses = ["CONFIRMED", "CANCELLED", "COMPLETED"];
  if (!validStatuses.includes(status)) {
    return Response.json({ error: "Estado inválido" }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return Response.json({ error: "Turno no encontrado" }, { status: 404 });
  }

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });

  if (appointment.clientId !== session.user.id && appointment.professionalId !== professional?.id) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status },
    include: {
      client: { select: { name: true, email: true } },
      professional: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (status === "CONFIRMED") {
    sendConfirmation({
      email: updated.client.email!,
      clientName: updated.client.name!,
      professionalName: updated.professional.user.name!,
      specialty: updated.professional.specialty,
      date: updated.date.toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: TZ_ARGENTINA,
      }),
      time: updated.date.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: TZ_ARGENTINA,
      }),
      duration: updated.duration,
    }).catch(() => {});
  }

  return Response.json(updated);
}
