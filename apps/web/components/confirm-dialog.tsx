"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void | Promise<void>;
  children: React.ReactNode;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-4 w-full max-w-sm animate-fade-in rounded-xl border bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    variant === "danger"
                      ? "bg-red-100"
                      : "bg-blue-100"
                  }`}
                >
                  <AlertTriangle
                    size={20}
                    className={
                      variant === "danger"
                        ? "text-red-600"
                        : "text-blue-600"
                    }
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{title}</h3>
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-all disabled:opacity-50 ${
                  variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Procesando..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
