import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@turnos/db";
import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { AppointmentActions } from "@/components/appointment-actions";
import { CalendarDays, Clock, User } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 border-amber-200 text-amber-700",
  CONFIRMED: "bg-green-50 border-green-200 text-green-700",
  CANCELLED: "bg-red-50 border-red-200 text-red-700",
  COMPLETED: "bg-blue-50 border-blue-200 text-blue-700",
} as const;

const STATUS_LABELS = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
} as const;

function isToday(date: Date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}
function isPast(date: Date) {
  return date < new Date();
}

export default async function AppointmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isProfessional = session.user.role === "PROFESSIONAL";

  const professional = isProfessional
    ? await prisma.professional.findUnique({
        where: { userId: session.user.id },
      })
    : null;

  const where = professional
    ? { professionalId: professional.id }
    : { clientId: session.user.id };

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      client: { select: { name: true, email: true } },
      professional: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { date: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <BackButton href="/dashboard" />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {isProfessional ? "Todos los turnos" : "Mis Turnos"}
        </h1>
        <span className="text-sm text-gray-400">
          {appointments.length} turno{appointments.length !== 1 ? "s" : ""}
        </span>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed bg-white p-12 text-center shadow-sm">
          <CalendarDays size={48} className="mx-auto text-gray-300" />
          <p className="mt-4 text-lg font-medium text-gray-500">
            No hay turnos
          </p>
          {!isProfessional && (
            <Link
              href="/"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Buscar profesionales disponibles &rarr;
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => {
            const aptDate = new Date(apt.date);
            const isRecent = isToday(aptDate);
            const expired = isPast(aptDate) && apt.status !== "COMPLETED";

            return (
              <div
                key={apt.id}
                className={`group rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${
                  isRecent ? "border-l-4 border-l-blue-500" : ""
                } ${expired ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isProfessional
                          ? "bg-purple-100 text-purple-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {isProfessional
                        ? apt.client.name.charAt(0)
                        : apt.professional.user.name.charAt(0)}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800">
                        {isProfessional
                          ? apt.client.name
                          : apt.professional.user.name}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={14} />
                          {aptDate.toLocaleDateString("es-AR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {aptDate.toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}hs
                        </span>
                        {isProfessional && (
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {apt.client.email}
                          </span>
                        )}
                      </div>

                      {apt.notes && (
                        <p className="mt-2 text-sm italic text-gray-400">
                          &ldquo;{apt.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {isProfessional ? (
                    <AppointmentActions
                      appointmentId={apt.id}
                      status={apt.status}
                    />
                  ) : (
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                        STATUS_STYLES[apt.status as keyof typeof STATUS_STYLES]
                      }`}
                    >
                      {STATUS_LABELS[apt.status as keyof typeof STATUS_LABELS]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
