/**
 * Proxy de Next.js (antes "middleware"). En Next 16 el archivo se llama
 * `proxy.ts` y exporta una función `proxy`.
 * Refresca la sesión de Supabase y protege las rutas privadas.
 */
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Se ejecuta en todas las rutas excepto archivos estáticos e imágenes:
     * - _next/static, _next/image
     * - favicon.ico y assets con extensión conocida
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
