import { prisma } from "@turnos/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const professional = await prisma.professional.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, image: true } },
      availability: { where: { isActive: true } },
    },
  });

  if (!professional) {
    return Response.json({ error: "Profesional no encontrado" }, { status: 404 });
  }

  return Response.json(professional);
}
