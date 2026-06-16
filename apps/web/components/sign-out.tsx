"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-1 text-red-500 hover:text-red-700"
    >
      <LogOut size={16} />
      Salir
    </button>
  );
}
