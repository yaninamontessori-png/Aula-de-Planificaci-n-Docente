"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = { ok?: boolean; error?: string };

/**
 * Actualiza el perfil de la docente autenticada.
 * La propiedad se valida por `user.id` y, además, por RLS en la base de datos.
 */
export async function updateProfile(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tu sesión expiró. Volvé a ingresar." };

  const displayName = String(formData.get("display_name") ?? "").trim();
  const institution = String(formData.get("institution") ?? "").trim();

  if (!displayName) return { error: "El nombre no puede quedar vacío." };

  // upsert cubre el caso (poco común) de que aún no exista la fila de perfil.
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, display_name: displayName, institution: institution || null },
      { onConflict: "id" },
    );

  if (error) return { error: "No se pudo guardar. Intentá nuevamente." };

  revalidatePath("/perfil");
  return { ok: true };
}
