import { prisma } from "@turnos/db";
import { auth } from "@/auth";

export async function GET() {
  const professionals = await prisma.professional.findMany({
    include: { user: { select: { name: true, email: true, image: true } } },
  });
  return Response.json(professionals);
}
