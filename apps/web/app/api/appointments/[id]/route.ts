import { prisma } from "@turnos/db";
import { auth } from "@/auth";

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
  });

  return Response.json(updated);
}
