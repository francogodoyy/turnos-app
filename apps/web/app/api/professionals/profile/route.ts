import { prisma } from "@turnos/db";
import { auth } from "@/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "No autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { professional: true },
  });

  if (!user?.professional) return Response.json({ error: "No sos profesional" }, { status: 403 });

  return Response.json(user.professional);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "No autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { professional: true },
  });

  if (!user?.professional) return Response.json({ error: "No sos profesional" }, { status: 403 });

  const body = await req.json();
  const { specialty, description, phone } = body;

  const updated = await prisma.professional.update({
    where: { id: user.professional.id },
    data: {
      ...(specialty !== undefined && { specialty }),
      ...(description !== undefined && { description }),
      ...(phone !== undefined && { phone }),
    },
  });

  return Response.json(updated);
}
