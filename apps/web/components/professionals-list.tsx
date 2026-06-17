"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar, Stethoscope } from "lucide-react";

interface Professional {
  id: string;
  specialty: string | null;
  user: { name: string; image: string | null };
  _count: { availability: number };
}

interface Props {
  professionals: Professional[];
}

export function ProfessionalsList({ professionals }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? professionals.filter((p) =>
        p.specialty?.toLowerCase().includes(query.toLowerCase())
      )
    : professionals;

  return (
    <>
      <div className="relative mb-8 max-w-md mx-auto">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por especialidad..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed bg-white p-12 text-center">
          <Search size={48} className="mx-auto text-gray-300" />
          <p className="mt-4 text-lg text-gray-500">
            {query
              ? `No se encontraron profesionales con "${query}"`
              : "No hay profesionales registrados aún"}
          </p>
          {!query && (
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
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/book/${p.id}`}
              className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600 overflow-hidden">
                  {p.user.image ? (
                    <img src={p.user.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    p.user.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{p.user.name}</h3>
                  {p.specialty && (
                    <p className="flex items-center gap-1 text-sm text-gray-500">
                      <Stethoscope size={14} />
                      {p.specialty}
                    </p>
                  )}
                  <p className="flex items-center gap-1 text-sm text-gray-400">
                    <Calendar size={14} />
                    {p._count.availability > 0
                      ? "Disponible"
                      : "Sin horarios cargados"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
