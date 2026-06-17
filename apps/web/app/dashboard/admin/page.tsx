import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@turnos/db";
import Link from "next/link";
import { Users, UserCheck, CalendarDays, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const [totalUsers, totalPros, totalAppointments] = await Promise.all([
    prisma.user.count(),
    prisma.professional.count(),
    prisma.appointment.count(),
  ]);

  const recentAppointments = await prisma.appointment.findMany({
    include: {
      client: { select: { name: true, email: true } },
      professional: { include: { user: { select: { name: true } } } },
    },
    orderBy: { date: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel de Administración</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Usuarios</p>
              <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <UserCheck size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Profesionales</p>
              <p className="text-2xl font-bold text-gray-800">{totalPros}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <CalendarDays size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Turnos</p>
              <p className="text-2xl font-bold text-gray-800">{totalAppointments}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Activity size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Promedio x prof.</p>
              <p className="text-2xl font-bold text-gray-800">
                {totalPros > 0 ? (totalAppointments / totalPros).toFixed(1) : "0"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-gray-800">Últimos turnos</h2>
        </div>
        <div className="divide-y">
          {recentAppointments.map((apt) => (
            <div key={apt.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <span className="font-medium text-gray-800">{apt.client.name}</span>
                <span className="mx-2 text-gray-300">→</span>
                <span className="text-gray-600">{apt.professional.user.name}</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  apt.status === "PENDING" ? "bg-amber-100 text-amber-700"
                  : apt.status === "CONFIRMED" ? "bg-green-100 text-green-700"
                  : apt.status === "CANCELLED" ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
                }`}
              >
                {apt.status === "PENDING" ? "Pendiente"
                  : apt.status === "CONFIRMED" ? "Confirmado"
                  : apt.status === "CANCELLED" ? "Cancelado"
                  : "Completado"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
