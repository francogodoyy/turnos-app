"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface Props {
  appointmentId: string;
  status: string;
}

const LABELS: Record<string, string> = {
  CONFIRMED: "aceptado",
  CANCELLED: "cancelado",
  COMPLETED: "completado",
};

export function AppointmentActions({ appointmentId, status }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    const res = await fetch(`/api/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    if (res.ok) {
      toast(`Turno ${LABELS[newStatus]} correctamente`, "success");
      router.refresh();
    } else {
      toast("Error al actualizar el turno", "error");
    }
  }

  if (status === "COMPLETED" || status === "CANCELLED") {
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          status === "COMPLETED"
            ? "bg-blue-100 text-blue-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {status === "COMPLETED" ? "Completado" : "Cancelado"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          status === "CONFIRMED"
            ? "bg-green-100 text-green-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {status === "CONFIRMED" ? "Confirmado" : "Pendiente"}
      </span>

      {status === "PENDING" && (
        <>
          <button
            onClick={() => updateStatus("CONFIRMED")}
            disabled={loading}
            className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
            title="Confirmar"
          >
            <CheckCircle size={18} />
          </button>
          <ConfirmDialog
            title="Cancelar turno"
            message="¿Estás seguro de cancelar este turno?"
            confirmLabel="Cancelar turno"
            variant="danger"
            onConfirm={() => updateStatus("CANCELLED")}
          >
            <button
              disabled={loading}
              className="rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-50"
              title="Cancelar"
            >
              <XCircle size={18} />
            </button>
          </ConfirmDialog>
        </>
      )}

      {status === "CONFIRMED" && (
        <>
          <ConfirmDialog
            title="Completar turno"
            message="Marcar este turno como completado. ¿El cliente asistió?"
            confirmLabel="Sí, completar"
            variant="default"
            onConfirm={() => updateStatus("COMPLETED")}
          >
            <button
              disabled={loading}
              className="rounded px-2 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              Completar
            </button>
          </ConfirmDialog>
          <ConfirmDialog
            title="Cancelar turno"
            message="El turno ya estaba confirmado. ¿Cancelarlo de todas formas?"
            confirmLabel="Sí, cancelar"
            variant="danger"
            onConfirm={() => updateStatus("CANCELLED")}
          >
            <button
              disabled={loading}
              className="rounded px-2 py-0.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </ConfirmDialog>
        </>
      )}
    </div>
  );
}
