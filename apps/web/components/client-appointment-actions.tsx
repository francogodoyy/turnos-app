"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { XCircle } from "lucide-react";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface Props {
  appointmentId: string;
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 border-amber-200 text-amber-700",
  CONFIRMED: "bg-green-50 border-green-200 text-green-700",
  CANCELLED: "bg-red-50 border-red-200 text-red-700",
  COMPLETED: "bg-blue-50 border-blue-200 text-blue-700",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
};

export function ClientAppointmentActions({ appointmentId, status }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function cancel() {
    setLoading(true);
    const res = await fetch(`/api/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setLoading(false);
    if (res.ok) {
      toast("Turno cancelado", "success");
      router.refresh();
    } else {
      toast("Error al cancelar", "error");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
          STATUS_STYLES[status] || ""
        }`}
      >
        {STATUS_LABELS[status] || status}
      </span>
      {status === "PENDING" && (
        <ConfirmDialog
          title="Cancelar turno"
          message="¿Estás seguro de cancelar este turno?"
          confirmLabel="Cancelar turno"
          variant="danger"
          onConfirm={cancel}
        >
          <button
            disabled={loading}
            className="rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-50"
            title="Cancelar turno"
          >
            <XCircle size={18} />
          </button>
        </ConfirmDialog>
      )}
    </div>
  );
}
