import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma, autoCompletePastAppointments } from "@turnos/db";
import { BackButton } from "@/components/back-button";
import type { Metadata } from "next";
import { TZ_ARGENTINA, toTzDate, UTC_OFFSET_ARG } from "@turnos/shared";

export const metadata: Metadata = {
  title: "Calendario semanal — Agendalo",
};

const STATUS_COLORS = {
  PENDING: "bg-amber-100 border-amber-300 text-amber-800",
  CONFIRMED: "bg-green-100 border-green-300 text-green-800",
  COMPLETED: "bg-blue-100 border-blue-300 text-blue-800",
  CANCELLED: "bg-red-100 border-red-300 text-red-300 line-through",
} as const;

const DAYS = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

async function getWeekAppointments(professionalId: string) {
  await autoCompletePastAppointments();

  const now = new Date();
  const nowArg = toTzDate(now);
  const weekStartArg = new Date(nowArg);
  weekStartArg.setDate(weekStartArg.getDate() - weekStartArg.getDay());
  weekStartArg.setHours(0, 0, 0, 0);
  const weekEndArg = new Date(weekStartArg);
  weekEndArg.setDate(weekEndArg.getDate() + 7);
  const weekStartUtc = toTzDate(weekStartArg, -UTC_OFFSET_ARG);
  const weekEndUtc = toTzDate(weekEndArg, -UTC_OFFSET_ARG);

  return prisma.appointment.findMany({
    where: {
      professionalId,
      date: { gte: weekStartUtc, lt: weekEndUtc },
    },
    include: { client: { select: { name: true } } },
    orderBy: { date: "asc" },
  });
}

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PROFESSIONAL") redirect("/dashboard");

  const professional = await prisma.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) redirect("/login");

  const appointments = await getWeekAppointments(professional.id);

  const now = new Date();
  const nowArg = toTzDate(now);
  const weekStartArg = new Date(nowArg);
  weekStartArg.setDate(weekStartArg.getDate() - weekStartArg.getDay());
  weekStartArg.setHours(0, 0, 0, 0);

  const nowArgToday = new Date();
  const todayArgDate = toTzDate(nowArgToday);

  const days = DAYS.map((name, i) => {
    const dateArg = new Date(weekStartArg);
    dateArg.setDate(dateArg.getDate() + i);
    const dayApps = appointments.filter(
      (a) => toTzDate(a.date).getDay() === i
    );
    return { name, date: dateArg, appointments: dayApps };
  });

  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  const weekEndDate = new Date(weekStartArg);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  return (
    <div className="space-y-4">
      <BackButton href="/dashboard" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Semana</h1>
          <p className="text-sm text-gray-400">
            {weekStartArg.toLocaleDateString("es-AR", {
              day: "numeric",
              month: "long",
              timeZone: TZ_ARGENTINA,
            })}
            {" - "}
            {weekEndDate.toLocaleDateString("es-AR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: TZ_ARGENTINA,
            })}
          </p>
        </div>
        <span className="text-sm text-gray-400">
          {appointments.length} turno{appointments.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white/80 to-transparent" />
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <div className="grid min-w-[1200px] grid-cols-[80px_repeat(7,160px)]">
          <div className="border-b border-r bg-gray-50 p-2 text-xs font-medium text-gray-400" />

          {days.map(({ name, date: dateArg, appointments: dayApps }) => {
            const isToday =
              dateArg.toDateString() === todayArgDate.toDateString();
            return (
              <div
                key={name}
                className={`border-b border-r p-2 text-center text-xs font-medium ${
                  isToday ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-500"
                }`}
              >
                <p>{name}</p>
                <p className="text-lg font-bold">{dateArg.getDate()}</p>
                <p className="text-[10px] opacity-60">{dayApps.length} turnos</p>
              </div>
            );
          })}

          {hours.map((hour) => (
            <div key={hour} className="contents">
              <div className="flex items-start justify-end border-b border-r p-2 text-xs text-gray-400">
                {String(hour).padStart(2, "0")}:00
              </div>

              {days.map(({ name, date: dateArg, appointments: dayApps }) => {
                const apt = dayApps.find(
                  (a) => toTzDate(a.date).getHours() === hour
                );
                return (
                  <div
                    key={`${name}-${hour}`}
                    className={`relative min-h-[60px] border-b border-r p-1 ${
                      apt ? "" : "hover:bg-gray-50"
                    }`}
                  >
                    {apt && (
                      <div
                        className={`rounded-lg border px-2 py-1.5 text-xs font-medium shadow-sm ${
                          STATUS_COLORS[
                            apt.status as keyof typeof STATUS_COLORS
                          ]
                        }`}
                      >
                        <p className="font-semibold">{apt.client.name}</p>
                        <p className="text-[10px] opacity-70">
                          {toTzDate(apt.date).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                          {" - "}
                          {toTzDate(
                            new Date(
                              apt.date.getTime() + apt.duration * 60000
                            )
                          ).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-amber-300 bg-amber-100" />
          Pendiente
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-green-300 bg-green-100" />
          Confirmado
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-blue-300 bg-blue-100" />
          Completado
        </span>
      </div>
    </div>
  );
}
