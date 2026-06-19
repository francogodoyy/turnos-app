import { prisma } from "@turnos/db";
import Link from "next/link";
import type { Metadata } from "next";
import { ProfessionalsList } from "@/components/professionals-list";

export const metadata: Metadata = {
  title: "TurnosApp — Reservá turnos con profesionales",
  description: "Encontrá al profesional que necesitás y agendá en segundos",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const professionals = await prisma.professional.findMany({
    include: {
      user: { select: { name: true, image: true } },
      _count: { select: { availability: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-blue-600">TurnosApp</h1>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/login"
              className="text-gray-600 hover:text-blue-600"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-800">
            Reservá turnos con profesionales
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            Encontrá al profesional que necesitás y agendá en segundos
          </p>
        </div>

        <ProfessionalsList professionals={professionals} />
      </main>
    </div>
  );
}
