"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { saveProfile } from "./data";
import { normalizeSkillIds, TEACHER_SUBJECTS } from "@/features/plans/schema";

const SUBJECT_IDS = new Set(TEACHER_SUBJECTS.map((s) => s.id as string));

export type ProfileActionState = { ok?: boolean; error?: string };

const NOTES_MAX = 600;

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

  // Enfoques pedagógicos ("skills"): checkboxes name="skills" (solo ids válidos).
  const skills = normalizeSkillIds(
    formData.getAll("skills").map((v) => String(v)),
  );
  const notes = String(formData.get("pedagogical_notes") ?? "")
    .trim()
    .slice(0, NOTES_MAX);
  const gradeRaw = String(formData.get("default_grade") ?? "").trim();
  const defaultGrade =
    gradeRaw && Number(gradeRaw) >= 1 && Number(gradeRaw) <= 7 ? Number(gradeRaw) : null;

  const role = String(formData.get("role") ?? "") === "directivo" ? "directivo" : "docente";
  const subjectRaw = String(formData.get("teaching_subject") ?? "").trim();
  const teachingSubject = SUBJECT_IDS.has(subjectRaw) ? subjectRaw : "grado";

  const err = await saveProfile(user.id, {
    displayName,
    institution: institution || null,
    defaultGrade,
    teachingSubject,
    role,
    teachingSkills: skills,
    pedagogicalNotes: notes || null,
  });
  if (err) return { error: err };

  revalidatePath("/perfil");
  return { ok: true };
}

/**
 * Completa el perfil la primera vez (modal de bienvenida) y marca onboarded.
 */
export async function completeOnboarding(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró. Volvé a ingresar." };

  const displayName = String(formData.get("display_name") ?? "").trim();
  if (!displayName) return { error: "Ingresá tu nombre." };

  const institution = String(formData.get("institution") ?? "").trim();
  const gradeRaw = String(formData.get("default_grade") ?? "").trim();
  const defaultGrade =
    gradeRaw && Number(gradeRaw) >= 1 && Number(gradeRaw) <= 7 ? Number(gradeRaw) : null;
  const subjectRaw = String(formData.get("teaching_subject") ?? "").trim();
  const teachingSubject = SUBJECT_IDS.has(subjectRaw) ? subjectRaw : "grado";
  const role = String(formData.get("role") ?? "") === "directivo" ? "directivo" : "docente";

  const err = await saveProfile(user.id, {
    displayName,
    institution: institution || null,
    defaultGrade,
    teachingSubject,
    role,
    onboarded: true,
  });
  if (err) return { error: err };

  // Revalida el layout para que el modal desaparezca.
  revalidatePath("/", "layout");
  return { ok: true };
}
