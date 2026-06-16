import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@turnos/ui", "@turnos/db", "@turnos/shared"],
  serverExternalPackages: [],
};

export default nextConfig;
