import { prisma } from "@turnos/db";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import BookingClient from "./booking-client";

export const dynamic = "force-dynamic";

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const professional = await prisma.professional.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, image: true } },
      availability: { where: { isActive: true }, orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!professional) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <a href="/" className="text-xl font-bold text-blue-600">
            TurnosApp
          </a>
          {!session?.user && (
            <a
              href="/login"
              className="text-sm text-blue-600 hover:underline"
            >
              Iniciar sesión
            </a>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
              {professional.user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {professional.user.name}
              </h1>
              {professional.description && (
                <p className="text-gray-500">{professional.description}</p>
              )}
              <p className="text-sm text-gray-400">
                Duración: {professional.duration} min
              </p>
            </div>
          </div>
        </div>

        <BookingClient
          professionalId={professional.id}
          duration={professional.duration}
          availability={professional.availability}
        />
      </main>
    </div>
  );
}
