/**
 * Acceso al perfil mapeando a las columnas reales de la tabla `profiles`
 * (que usa nombres en español: nombre/escuela/rol). Todo del lado servidor,
 * con clave de servicio (omite RLS) filtrando siempre por el id autenticado.
 */
import { createAdminClient } from "@/lib/supabase/admin";

export type ProfileData = {
  display_name: string | null;
  institution: string | null;
  default_grade: number | null;
  teaching_skills: string[];
  pedagogical_notes: string | null;
  role: string;
  teaching_subject: string | null;
  onboarded: boolean;
};

export async function getProfile(userId: string): Promise<ProfileData | null> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return null; // Sin clave de servicio: la app igual renderiza.
  }
  const { data } = await admin
    .from("profiles")
    .select(
      "nombre, escuela, default_grade, teaching_skills, pedagogical_notes, role, teaching_subject, onboarded",
    )
    .eq("id", userId)
    .maybeSingle();
  if (!data) return null;
  const d = data as Record<string, unknown>;
  return {
    display_name: (d.nombre as string) ?? null,
    institution: (d.escuela as string) ?? null,
    default_grade: (d.default_grade as number) ?? null,
    teaching_skills: (d.teaching_skills as string[]) ?? [],
    pedagogical_notes: (d.pedagogical_notes as string) ?? null,
    role: (d.role as string) ?? "docente",
    teaching_subject: (d.teaching_subject as string) ?? null,
    onboarded: Boolean(d.onboarded),
  };
}

export type SaveProfileInput = {
  displayName: string;
  institution: string | null;
  defaultGrade: number | null;
  teachingSubject: string;
  role: string;
  teachingSkills?: string[];
  pedagogicalNotes?: string | null;
  onboarded?: boolean;
};

/** Devuelve un mensaje de error, o null si guardó bien. */
export async function saveProfile(
  userId: string,
  input: SaveProfileInput,
): Promise<string | null> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return "Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor.";
  }

  // Se escriben las columnas reales; nombre y rol son obligatorias en la tabla.
  const row: Record<string, unknown> = {
    id: userId,
    nombre: input.displayName,
    escuela: input.institution,
    // `rol` es una columna vieja con CHECK (no la usa la app); valor válido fijo.
    rol: "maestra",
    role: input.role,
    default_grade: input.defaultGrade,
    teaching_subject: input.teachingSubject,
  };
  if (input.teachingSkills !== undefined) row.teaching_skills = input.teachingSkills;
  if (input.pedagogicalNotes !== undefined) row.pedagogical_notes = input.pedagogicalNotes;
  if (input.onboarded !== undefined) row.onboarded = input.onboarded;

  const { error } = await admin.from("profiles").upsert(row, { onConflict: "id" });
  if (error) {
    console.error("saveProfile error:", error);
    return `No se pudo guardar: ${error.message}`;
  }
  return null;
}
