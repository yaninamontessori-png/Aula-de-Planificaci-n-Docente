/**
 * Variables de entorno públicas (prefijo NEXT_PUBLIC_).
 *
 * Se leen de forma perezosa mediante getters: así el `next build` no falla
 * cuando aún no hay secretos configurados, y el error solo aparece —claro y
 * accionable— si realmente se intenta usar Supabase sin configuración.
 *
 * Los secretos del servidor (SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY) NUNCA
 * se referencian en este módulo, que es seguro de importar en el navegador.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copiá .env.example a .env.local y completá los valores.`,
    );
  }
  return value;
}

export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY() {
    return required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  },
  get NEXT_PUBLIC_SITE_URL() {
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  },
};
