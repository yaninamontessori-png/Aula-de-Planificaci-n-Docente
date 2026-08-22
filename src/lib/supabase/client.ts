"use client";

/**
 * Cliente de Supabase para el NAVEGADOR (componentes cliente).
 * Usa la clave publishable (segura para el frontend: RLS protege los datos).
 */
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
