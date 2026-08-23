"use client";

import { SECTION_LABELS, type GeneratedSections } from "@/features/plans/schema";

const tipoLabel: Record<string, string> = {
  unidad_mensual: "Unidad didáctica mensual",
  secuencia_clases: "Secuencia de clases",
};

type PlanForDownload = {
  title: string;
  planning_type: string;
  grade: number;
  institution: string | null;
  duration: string | null;
  guiding_question: string;
};

export function DownloadButton({
  plan,
  sections,
}: {
  plan: PlanForDownload;
  sections: Partial<GeneratedSections>;
}) {
  const handleDownload = () => {
    const content = `PLANIFICACIÓN DIDÁCTICA
${plan.title}

DATOS GENERALES
Tipo: ${tipoLabel[plan.planning_type] ?? plan.planning_type}
Grado: ${plan.grade}º
Institución: ${plan.institution ?? "No especificada"}
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
