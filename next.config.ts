import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz del proyecto para Turbopack. Evita que Next infiera una carpeta
  // superior (por un lockfile ajeno en el directorio del usuario) como workspace.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
