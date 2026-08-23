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

      <div className="mt-8 flex gap-3">
        <DownloadButton plan={plan} sections={sections} />
      </div>
    </div>
  );
}

function DownloadButton({ plan, sections }: { plan: any; sections: Partial<GeneratedSections> }) {
  const handleDownload = () => {
    const content = `
PLANIFICACIÓN DIDÁCTICA
${plan.title}

DATOS GENERALES
Tipo: ${tipoLabel[plan.planning_type] ?? plan.planning_type}
Grado: ${plan.grade}º
Institución: ${plan.institution}
Duración: ${plan.duration || "No especificada"}

PREGUNTA ORIENTADORA
${plan.guiding_question}

${Object.entries(sections)
  .filter(([, value]) => value?.trim())
  .map(([key, value]) => `${SECTION_LABELS[key as keyof GeneratedSections]}\n${value}`)
  .join("\n\n")}

---
Generado con Aula de Planificación
${new Date().toLocaleDateString("es-AR")}
    `;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${plan.title}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-2 disabled:opacity-55"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Descargar
    </button>
  );
}
