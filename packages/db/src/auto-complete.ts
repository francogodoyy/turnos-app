import { prisma } from "./index";

export async function autoCompletePastAppointments() {
  const now = new Date();

  const expired = await prisma.appointment.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      date: { lt: new Date(now.getTime() - 60 * 60 * 1000) },
    },
    select: { id: true },
  });

  if (expired.length === 0) return;

  await prisma.appointment.updateMany({
    where: { id: { in: expired.map((a) => a.id) } },
    data: { status: "COMPLETED" },
  });
}
