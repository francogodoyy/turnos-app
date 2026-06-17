import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Turnos App",
  description: "Gestión de turnos profesionales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 antialiased dark:bg-gray-900">
        <Providers>
          <div className="animate-fade-in">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
