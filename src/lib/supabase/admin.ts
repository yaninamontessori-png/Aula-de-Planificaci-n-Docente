/**
 * Cliente de Supabase con clave de servicio (SOLO servidor).
 * Omite RLS: usar únicamente en Server Actions / Server Components y siempre
 * filtrando por el id de la usuaria autenticada. NUNCA exponer al navegador.
 */
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY (o la URL). Configurala en las variables de entorno.",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
