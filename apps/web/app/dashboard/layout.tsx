import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Clock, LayoutDashboard, CalendarRange } from "lucide-react";
import { SignOutButton } from "@/components/sign-out";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const isProfessional = session.user.role === "PROFESSIONAL";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-blue-600"
          >
            TurnosApp
          </Link>

          <nav className="flex items-center gap-1 sm:gap-4 text-sm font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
            >
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            {isProfessional && (
              <>
                <Link
                  href="/dashboard/schedule"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                >
                  <CalendarRange size={16} />
                  <span className="hidden sm:inline">Semana</span>
                </Link>
                <Link
                  href="/dashboard/availability"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                >
                  <Clock size={16} />
                  <span className="hidden sm:inline">Disponibilidad</span>
                </Link>
              </>
            )}
            <Link
              href="/appointments"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
            >
              <CalendarDays size={16} />
              <span className="hidden sm:inline">Turnos</span>
            </Link>

            <div className="ml-2 hidden items-center gap-3 sm:flex">
              <span className="h-5 w-px bg-gray-200" />
              <span className="text-xs text-gray-400">
                {session.user.name}
              </span>
            </div>

            <SignOutButton />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
