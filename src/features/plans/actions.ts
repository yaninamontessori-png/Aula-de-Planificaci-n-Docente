"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  planDraftSchema,
  generatedSectionsSchema,
  type GeneratedSections,
} from "./schema";
import { generateSections, GEMINI_MODEL } from "./gemini";

export type GenerateResult =
  | { ok: true; sections: GeneratedSections; model: string }
  | { ok: false; error: string };

export type SaveResult = { ok: true; planId: string } | { ok: false; error: string };

const MONTHLY_LIMIT = 50;

/**
 * Genera el borrador con IA. Valida sesión y datos, controla el uso mensual,
 * registra el evento y devuelve las secciones. La clave de Gemini nunca sale
 * del servidor.
 */
export async function generatePlan(input: unknown): Promise<GenerateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Volvé a ingresar." };

  const parsed = planDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Revisá los datos." };
  }
  const draft = parsed.data;

  // Control de uso mensual (nivel gratuito).
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const { data: usage } = await supabase
    .from("usage_limits")
    .select("period_start, generations_used, monthly_limit")
    .eq("user_id", user.id)
    .maybeSingle();
  const sameMonth = usage?.period_start?.slice(0, 7) === month;
  const used = sameMonth ? usage!.generations_used : 0;
  const limit = usage?.monthly_limit ?? MONTHLY_LIMIT;
  if (used >= limit) {
    return { ok: false, error: `Alcanzaste el límite mensual de ${limit} generaciones.` };
  }

  try {
    const { sections, model, inputTokens, outputTokens } = await generateSections(draft);
    await supabase.from("generation_events").insert({
      user_id: user.id,
      status: "exito",
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
    });
    await supabase.from("usage_limits").upsert(
      { user_id: user.id, period_start: `${month}-01`, generations_used: used + 1, monthly_limit: limit },
      { onConflict: "user_id" },
    );
    return { ok: true, sections, model };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo generar la planificación.";
    await supabase.from("generation_events").insert({
      user_id: user.id,
      status: "error",
      model: GEMINI_MODEL,
      error_code: msg.slice(0, 120),
    });
    return { ok: false, error: msg };
  }
}

/**
 * Guarda la planificación (y sus contenidos) de la docente autenticada.
 * La propiedad se garantiza por user.id y por RLS.
 */
export async function savePlan(input: unknown, sectionsInput: unknown): Promise<SaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Volvé a ingresar." };

  const parsed = planDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Revisá los datos." };
  }
  const draft = parsed.data;

  const complete = generatedSectionsSchema.safeParse(sectionsInput);
  const sections = complete.success
    ? complete.data
    : ((sectionsInput as GeneratedSections | null) ?? {});
  const status = complete.success ? "completo" : "borrador";

  const { data: plan, error } = await supabase
    .from("plans")
    .insert({
      user_id: user.id,
      teacher_name: draft.teacherName,
      institution: draft.institution || null,
      grade: draft.grade,
      planning_type: draft.planningType,
      duration: draft.duration || null,
      start_date: draft.startDate || null,
      title: complete.success ? complete.data.titulo || draft.title : draft.title,
      guiding_question: draft.guidingQuestion,
      teacher_resource: draft.teacherResource || null,
      generated_sections: sections,
      status,
      ai_model: status === "completo" ? GEMINI_MODEL : null,
    })
    .select("id")
    .single();

  if (error || !plan) return { ok: false, error: "No se pudo guardar la planificación." };

  const rows = draft.contents.map((c) => ({
    plan_id: plan.id,
    curriculum_content_id: c.id,
  }));
  const { error: linkError } = await supabase.from("plan_contents").insert(rows);
  if (linkError) {
    return { ok: false, error: "La planificación se creó pero fallaron los contenidos. Revisá el detalle." };
  }

  revalidatePath("/planificaciones");
  return { ok: true, planId: plan.id };
}
