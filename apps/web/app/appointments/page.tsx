import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@turnos/db";
import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { AppointmentActions } from "@/components/appointment-actions";
import { ClientAppointmentActions } from "@/components/client-appointment-actions";
import { CalendarDays, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";
import { TZ_ARGENTINA, toTzDate } from "@turnos/shared";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

function isToday(date: Date) {
  const todayArg = toTzDate(new Date());
  const dateArg = toTzDate(date);
  return dateArg.toDateString() === todayArg.toDateString();
}
function isPast(date: Date) {
  return toTzDate(date) < toTzDate(new Date());
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

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

  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      include: {
        client: { select: { name: true, email: true } },
        professional: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <BackButton href="/dashboard" />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {isProfessional ? "Todos los turnos" : "Mis Turnos"}
        </h1>
        <span className="text-sm text-gray-400">
          {total} turno{total !== 1 ? "s" : ""}
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
        <>
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
                              timeZone: TZ_ARGENTINA,
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {aptDate.toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: TZ_ARGENTINA,
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
                      <ClientAppointmentActions
                        appointmentId={apt.id}
                        status={apt.status}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <Link
                href={page > 1 ? `?page=${page - 1}` : "#"}
                className={`flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  page <= 1
                    ? "pointer-events-none border-gray-100 text-gray-300"
                    : "border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600"
                }`}
              >
                <ChevronLeft size={16} />
                Anterior
              </Link>

              <span className="text-sm text-gray-500">
                Página {page} de {totalPages}
              </span>

              <Link
                href={page < totalPages ? `?page=${page + 1}` : "#"}
                className={`flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  page >= totalPages
                    ? "pointer-events-none border-gray-100 text-gray-300"
                    : "border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600"
                }`}
              >
                Siguiente
                <ChevronRight size={16} />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
