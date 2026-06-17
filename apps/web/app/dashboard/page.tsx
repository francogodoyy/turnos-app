import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@turnos/db";
import Link from "next/link";
import { AppointmentActions } from "@/components/appointment-actions";
import { CalendarCheck, Clock, AlertCircle, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

async function getProfessional(session: any) {
  return prisma.professional.findUnique({
    where: { userId: session.user.id },
    select: { id: true, duration: true },
  });
}

async function getTodayCount(professionalId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.appointment.count({
    where: { professionalId, date: { gte: today, lt: tomorrow } },
  });
}

async function getPendingAppointments(professionalId: string) {
  return prisma.appointment.findMany({
    where: { professionalId, status: "PENDING" },
    include: {
      client: { select: { name: true, email: true } },
    },
    orderBy: { date: "asc" },
  });
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isProfessional = session.user.role === "PROFESSIONAL";

  if (isProfessional) {
    const professional = await getProfessional(session);
    if (!professional) redirect("/login");

    const [todayCount, pendingAppointments] = await Promise.all([
      getTodayCount(professional.id),
      getPendingAppointments(professional.id),
    ]);

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <CalendarCheck size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Turnos hoy
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {todayCount}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <AlertCircle size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Pendientes
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {pendingAppointments.length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Clock size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Duración turno
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {professional.duration} min
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-800">
              Turnos pendientes
              {pendingAppointments.length > 0 && (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {pendingAppointments.length}
                </span>
              )}
            </h2>
          </div>

          {pendingAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <CheckCircle
                size={40}
                className="mx-auto text-green-300"
              />
              <p className="mt-2 font-medium">No hay turnos pendientes</p>
            </div>
          ) : (
            <div className="divide-y">
              {pendingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-600">
                      {apt.client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {apt.client.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(apt.date).toLocaleDateString("es-AR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <AppointmentActions
                    appointmentId={apt.id}
                    status={apt.status}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis Turnos</h1>

      <ClientAppointments userId={session.user.id} />
    </div>
  );
}

async function ClientAppointments({ userId }: { userId: string }) {
  const appointments = await prisma.appointment.findMany({
    where: { clientId: userId },
    include: {
      professional: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { date: "desc" },
    take: 10,
  });

  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">No tenés turnos reservados</p>
        <Link
          href="/"
          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
        >
          Buscar profesionales
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => (
        <div
          key={apt.id}
          className="rounded-lg border bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {apt.professional.user.name}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(apt.date).toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                apt.status === "CONFIRMED"
                  ? "bg-green-100 text-green-700"
                  : apt.status === "CANCELLED"
                  ? "bg-red-100 text-red-700"
                  : apt.status === "COMPLETED"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {apt.status === "PENDING"
                ? "Pendiente"
                : apt.status === "CONFIRMED"
                ? "Confirmado"
                : apt.status === "CANCELLED"
                ? "Cancelado"
                : "Completado"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
