import { prisma } from "@turnos/db";
import { auth } from "@/auth";
import { AvailabilitySlot } from "@turnos/shared";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
    include: { availability: { where: { isActive: true }, orderBy: { dayOfWeek: "asc" } } },
  });

  if (!professional) {
    return Response.json({ error: "No sos un profesional" }, { status: 403 });
  }

  return Response.json(professional.availability);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });

  if (!professional) {
    return Response.json({ error: "No sos un profesional" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = AvailabilitySlot.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const slot = await prisma.availability.create({
    data: {
      professionalId: professional.id,
      ...parsed.data,
    },
  });

  return Response.json(slot, { status: 201 });
}
