import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SECTION_LABELS, type GeneratedSections } from "@/features/plans/schema";

export const metadata: Metadata = { title: "Detalle de planificación" };

const tipoLabel: Record<string, string> = {
  unidad_mensual: "Unidad didáctica mensual",
  secuencia_clases: "Secuencia de clases",
};

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS garantiza que solo se devuelva si la planificación es de la docente.
  const { data: plan } = await supabase.from("plans").select("*").eq("id", id).maybeSingle();
  if (!plan) notFound();

  const sections = (plan.generated_sections ?? {}) as Partial<GeneratedSections>;
  const keys = (Object.keys(SECTION_LABELS) as (keyof GeneratedSections)[]).filter(
    (k) => sections[k]?.trim(),
  );

  return (
    <div>
      <Link href="/planificaciones" className="text-sm font-semibold text-muted hover:text-brand">
        ← Mis planificaciones
      </Link>
      <h1 className="mt-3 font-heading text-3xl font-bold text-brand">{plan.title}</h1>
      <p className="mt-1 text-sm text-muted">
        {tipoLabel[plan.planning_type] ?? plan.planning_type} · {plan.grade}.º grado
        {plan.duration ? ` · ${plan.duration}` : ""}
      </p>
      <p className="mt-4 rounded-lg bg-surface-2 p-4 italic text-brand-ink">
        {plan.guiding_question}
      </p>

      {keys.length > 0 ? (
        <div className="mt-6 space-y-3">
          {keys.map((key) => (
            <section key={key} className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="font-heading text-lg font-bold text-brand">{SECTION_LABELS[key]}</h2>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink">{sections[key]}</p>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6 text-muted">
          Esta planificación se guardó como borrador, sin secciones generadas.
        </div>
      )}

      <p className="mt-6 text-sm text-muted">
        La edición por secciones, duplicar, eliminar y las descargas Word/PDF
        llegan en la próxima etapa.
      </p>
    </div>
  );
}
