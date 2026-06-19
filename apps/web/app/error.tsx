"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <AlertTriangle size={64} className="text-red-300" />
      <h1 className="mt-6 text-4xl font-bold text-gray-800">Algo salió mal</h1>
      <p className="mt-2 text-gray-500">
        Ocurrió un error inesperado. Intentalo de nuevo.
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow active:scale-95"
      >
        Reintentar
      </button>
    </div>
  );
}
