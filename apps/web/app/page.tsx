import { prisma } from "@turnos/db";
import Link from "next/link";
import { Search, Calendar } from "lucide-react";

export default async function HomePage() {
  const professionals = await prisma.professional.findMany({
    include: {
      user: { select: { name: true, image: true } },
      _count: { select: { availability: true } },
    },
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

        {professionals.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed bg-white p-12 text-center">
            <Search size={48} className="mx-auto text-gray-300" />
            <p className="mt-4 text-lg text-gray-500">
              No hay profesionales registrados aún
            </p>
            {professionals.length === 0 && (
              <p className="mt-1 text-sm text-gray-400">
                Si sos profesional,{" "}
                <Link href="/register" className="text-blue-600 hover:underline">
                  registrate acá
                </Link>
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.map((p) => (
              <Link
                key={p.id}
                href={`/book/${p.id}`}
                className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                    {p.user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{p.user.name}</h3>
                    <p className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar size={14} />
                      {p._count.availability > 0
                        ? `Disponible`
                        : "Sin horarios cargados"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
