"use client";

import { DAYS_OF_WEEK } from "@turnos/shared";
import { Trash2, Plus, Clock } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { useToast } from "@/components/toast";
import { useEffect, useState } from "react";

interface Slot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, "0")}:00`
);

const DAY_COLORS = [
  "border-red-200 bg-red-50",
  "border-orange-200 bg-orange-50",
  "border-amber-200 bg-amber-50",
  "border-yellow-200 bg-yellow-50",
  "border-green-200 bg-green-50",
  "border-blue-200 bg-blue-50",
  "border-purple-200 bg-purple-50",
] as const;

export default function AvailabilityPage() {
  const { toast } = useToast();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/availability")
      .then(async (r) => {
        if (r.status === 403) window.location.href = "/dashboard";
        return r.json();
      })
      .then(setSlots)
      .finally(() => setLoading(false));
  }, []);

  async function addSlot() {
    const res = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayOfWeek, startTime, endTime }),
    });

    if (res.ok) {
      const newSlot = await res.json();
      setSlots((prev) => [...prev, newSlot]);
      toast("Franja horaria agregada", "success");
    } else {
      toast("Error al agregar la franja", "error");
    }
  }

  async function deleteSlot(id: string) {
    const res = await fetch(`/api/availability/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSlots((prev) => prev.filter((s) => s.id !== id));
      toast("Franja eliminada", "success");
    }
  }

  const totalSlots = slots.length;
  const coveredDays = new Set(slots.map((s) => s.dayOfWeek)).size;

  if (loading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <BackButton href="/dashboard" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Disponibilidad</h1>
          <p className="text-sm text-gray-500">
            Configurá los horarios en que atendés
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Franjas cargadas</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{totalSlots}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Días cubiertos</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {coveredDays}/7
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-700">
          <Plus size={18} className="text-blue-500" />
          Agregar franja horaria
        </h2>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
              Día
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="mt-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {DAYS_OF_WEEK.map((day, i) => (
                <option key={i} value={i}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
              Desde
            </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {HOURS.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
              Hasta
            </label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {HOURS.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </div>

          <button
            onClick={addSlot}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow active:scale-95"
          >
            <Plus size={18} />
            Agregar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DAYS_OF_WEEK.map((day, idx) => {
          const daySlots = slots.filter((s) => s.dayOfWeek === idx);
          return (
            <div
              key={day}
              className={`rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                daySlots.length > 0 ? DAY_COLORS[idx] : "border-gray-100"
              }`}
            >
              <h3
                className={`mb-3 text-sm font-bold uppercase tracking-wider ${
                  daySlots.length > 0
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {day}
              </h3>

              {daySlots.length === 0 ? (
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  Sin horarios
                </p>
              ) : (
                <div className="space-y-2">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="group flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-gray-100 transition-all hover:ring-blue-200"
                    >
                      <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <Clock size={14} className="text-blue-400" />
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="rounded p-1 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
