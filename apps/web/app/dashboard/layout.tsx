import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Clock, LayoutDashboard, CalendarRange, Shield } from "lucide-react";
import { SignOutButton } from "@/components/sign-out";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const isProfessional = session.user.role === "PROFESSIONAL";
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-blue-600"
          >
            Agendalo
          </Link>

          <nav className="flex items-center gap-1 sm:gap-4 text-sm font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-950 dark:hover:text-blue-400"
            >
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            {isProfessional && (
              <>
                <Link
                  href="/dashboard/schedule"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                >
                  <CalendarRange size={16} />
                  <span className="hidden sm:inline">Semana</span>
                </Link>
                <Link
                  href="/dashboard/availability"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                >
                  <Clock size={16} />
                  <span className="hidden sm:inline">Disponibilidad</span>
                </Link>
              </>
            )}
            <Link
              href="/appointments"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-950 dark:hover:text-blue-400"
            >
              <CalendarDays size={16} />
              <span className="hidden sm:inline">Turnos</span>
            </Link>
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-950 dark:hover:text-blue-400"
              >
                <Shield size={16} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            <div className="ml-2 hidden items-center gap-3 sm:flex">
              <span className="h-5 w-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {session.user.name}
              </span>
            </div>

            <ThemeToggle />
            <SignOutButton />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8 dark:text-gray-200">{children}</main>
    </div>
  );
}
