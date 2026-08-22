// =============================================================================
// Edge Function: generate-plan  (Supabase / Deno)
// Genera el borrador de planificación con Gemini desde el BACKEND.
//
// Estado: ESQUELETO de la próxima entrega. Todavía NO está cableada al frontend.
// Antes de usar en producción:
//   1. supabase functions deploy generate-plan
//   2. supabase secrets set GEMINI_API_KEY=...   (NUNCA con prefijo NEXT_PUBLIC)
//   3. Verificar el nombre del modelo disponible en tu proyecto de Gemini.
//   4. Escribir tests de la validación de entrada/salida.
//
// Seguridad incluida: valida el JWT de Supabase, valida la entrada, aplica CORS
// restringido y solo actúa sobre datos del usuario autenticado.
// =============================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
const ALLOWED_ORIGIN = Deno.env.get("SITE_URL") ?? "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  // --- 1. Autenticación: validar el JWT de Supabase -------------------------
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Falta el token de sesión." }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: "Sesión inválida." }, 401);

  // --- 2. Validación de entrada --------------------------------------------
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Cuerpo JSON inválido." }, 400);
  }

  const data = payload as Record<string, unknown>;
  const contents = Array.isArray(data.contents) ? data.contents : [];
  const areas = new Set(
    contents.map((c) => (c as { area?: string }).area?.trim()).filter(Boolean),
  );
  if (
    typeof data.guidingQuestion !== "string" ||
    data.guidingQuestion.trim().length < 10 ||
    areas.size < 2
  ) {
    return json(
      {
        error:
          "Datos insuficientes: se requiere pregunta y contenidos de al menos dos áreas.",
      },
      400,
    );
  }

  // --- 3. Límite de uso por usuario (nivel gratuito) ------------------------
  // TODO: leer/incrementar public.usage_limits antes de llamar a la IA.

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json({ error: "La IA no está configurada." }, 503);

  // --- 4. Llamada a Gemini con respuesta JSON estructurada ------------------
  // TODO: construir el prompt sin datos personales innecesarios, invocar el
  // modelo con responseSchema, validar la salida con generatedSectionsSchema,
  // registrar el evento en public.generation_events y devolver las secciones.

  return json(
    {
      error:
        "Función en construcción. La generación con IA se habilita en la próxima entrega.",
      model: GEMINI_MODEL,
    },
    501,
  );
});
