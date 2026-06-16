"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ href }: { href?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => (href ? router.push(href) : router.back())}
      className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
    >
      <ArrowLeft size={16} />
      Volver
    </button>
  );
}
