import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de OAuth (Google). Intercambia el código por una sesión y redirige
 * a la ruta destino. Solo se aceptan destinos internos (que empiecen con "/").
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/nueva";

  // El proveedor (Supabase/Google) puede volver con un error en vez de un código.
  const providerError = searchParams.get("error_description") || searchParams.get("error");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] exchangeCodeForSession falló:", error.message);
  } else if (providerError) {
    console.error("[auth/callback] error del proveedor:", providerError);
  } else {
    console.error("[auth/callback] no llegó ningún código.");
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
