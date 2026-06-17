"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const registered = searchParams.get("registered") === "pro";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email") as string,
      password: form.get("password") as string,
      redirect: false,
    });

    if (res?.error) {
      setError("Email o contraseña inválidos");
    } else {
      const redirectTo = registered ? "/dashboard/availability" : "/dashboard";
      router.push(redirectTo);
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-8 shadow-sm"
      >
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>

        {registered && (
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <Clock size={20} className="mt-0.5 shrink-0 text-blue-500" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Registrado como profesional</p>
              <p className="mt-1 text-blue-600">
                Configurá tu disponibilidad horaria para empezar a recibir turnos
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>
        )}

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Contraseña</label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Ingresar
        </button>

        <p className="text-center text-sm text-gray-500">
          ¿No tenés cuenta?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Registrate
          </a>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
