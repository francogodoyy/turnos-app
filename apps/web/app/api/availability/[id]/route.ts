import { prisma } from "@turnos/db";
import { auth } from "@/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  const slot = await prisma.availability.findUnique({ where: { id } });
  if (!slot) {
    return Response.json({ error: "Franja no encontrada" }, { status: 404 });
  }

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });

  if (slot.professionalId !== professional?.id) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  await prisma.availability.delete({ where: { id } });

  return Response.json({ message: "Eliminada" });
}
