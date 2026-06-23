import Link from "next/link";
import type { Metadata } from "next";
import { CalendarX } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Página no encontrada — Agendalo",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <CalendarX size={64} className="text-gray-300" />
      <h1 className="mt-6 text-5xl font-bold text-gray-800">404</h1>
      <p className="mt-2 text-lg text-gray-500">
        Esta página no existe
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow active:scale-95"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
