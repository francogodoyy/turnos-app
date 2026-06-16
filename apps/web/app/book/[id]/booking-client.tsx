"use client";

import { useRouter } from "next/navigation";
import { DAYS_OF_WEEK } from "@turnos/shared";
import { useState } from "react";
import { CalendarDays, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/components/toast";

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Props {
  professionalId: string;
  duration: number;
  availability: AvailabilitySlot[];
}

function getNextDateForDay(dayOfWeek: number): Date {
  const today = new Date();
  const diff = (dayOfWeek - today.getDay() + 7) % 7;
  const date = new Date(today);
  date.setDate(today.getDate() + (diff === 0 ? 7 : diff));
  return date;
}

function generateTimeSlots(
  startTime: string,
  endTime: string,
  duration: number
): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;

  for (let t = start; t + duration <= end; t += duration) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }

  return slots.slice(0, 8);
}

const DAY_COLORS = [
  "border-gray-200 text-gray-500",
  "border-red-200 text-red-600",
  "border-orange-200 text-orange-600",
  "border-amber-200 text-amber-600",
  "border-green-200 text-green-600",
  "border-blue-200 text-blue-600",
  "border-purple-200 text-purple-600",
] as const;

export default function BookingClient({
  professionalId,
  duration,
  availability,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState(-1);
  const [selectedTime, setSelectedTime] = useState("");
  const [saving, setSaving] = useState(false);

  const dayAvailability = availability.find(
    (a) => a.dayOfWeek === selectedDay
  );

  const timeSlots = dayAvailability
    ? generateTimeSlots(
        dayAvailability.startTime,
        dayAvailability.endTime,
        duration
      )
    : [];

  const date = selectedDay >= 0 ? getNextDateForDay(selectedDay) : null;

  async function handleBook() {
    if (!selectedTime || !date) return;
    setSaving(true);

    const [h, m] = selectedTime.split(":").map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(h, m, 0, 0);

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professionalId,
        date: appointmentDate.toISOString(),
      }),
    });

    if (res.ok) {
      toast("Turno reservado con éxito!", "success");
      setTimeout(() => router.push("/dashboard"), 1500);
    } else {
      const data = await res.json();
      toast(data.error || "Error al reservar", "error");
    }
    setSaving(false);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-700">
            <CalendarDays size={18} className="text-blue-500" />
            Seleccioná un día
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day, i) => {
              const hasAvailability = availability.some(
                (a) => a.dayOfWeek === i
              );
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedDay(i);
                    setSelectedTime("");
                  }}
                  disabled={!hasAvailability}
                  className={`flex flex-col items-center rounded-xl border-2 px-2 py-3 text-sm font-medium transition-all ${
                    selectedDay === i
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                      : hasAvailability
                      ? `${DAY_COLORS[i]} bg-white hover:shadow-sm`
                      : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
                  }`}
                >
                  <span className="text-xs uppercase">{day.slice(0, 3)}</span>
                  {hasAvailability && (
                    <span className="mt-1 text-[10px] text-green-500">●</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {dayAvailability && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-700">
              <Clock size={18} className="text-blue-500" />
              Horarios disponibles
              <span className="ml-auto text-xs font-normal text-gray-400">
                {dayAvailability.startTime} - {dayAvailability.endTime}
              </span>
            </h2>
            {timeSlots.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No hay horarios disponibles para este rango
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                      selectedTime === t
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:shadow-sm"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-8">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-700">
              <CheckCircle size={18} className="text-blue-500" />
              Resumen
            </h2>

            {!selectedTime || !date ? (
              <div className="py-8 text-center">
                <CalendarDays size={40} className="mx-auto text-gray-200" />
                <p className="mt-3 text-sm text-gray-400">
                  Seleccioná un día y horario
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center justify-between">
                      <span className="text-gray-500">Día</span>
                      <span className="font-medium text-gray-800">
                        {date.toLocaleDateString("es-AR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                    </p>
                    <div className="h-px bg-blue-100" />
                    <p className="flex items-center justify-between">
                      <span className="text-gray-500">Horario</span>
                      <span className="font-medium text-gray-800">
                        {selectedTime} hs
                      </span>
                    </p>
                    <div className="h-px bg-blue-100" />
                    <p className="flex items-center justify-between">
                      <span className="text-gray-500">Duración</span>
                      <span className="font-medium text-gray-800">
                        {duration} min
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleBook}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Reservando...
                    </>
                  ) : (
                    <>
                      Reservar turno
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
