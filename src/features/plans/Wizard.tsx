"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ContentSelector } from "./ContentSelector";
import { generatePlan, savePlan } from "./actions";
import {
  GRADES,
  SECTION_LABELS,
  countAreas,
  type GeneratedSections,
  type SelectedContent,
} from "./schema";

const STEPS = ["Datos", "Contenidos", "Pregunta", "Planificación"] as const;

export function Wizard({
  defaultTeacherName,
  defaultInstitution,
}: {
  defaultTeacherName: string;
  defaultInstitution: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [teacherName, setTeacherName] = useState(defaultTeacherName);
  const [institution, setInstitution] = useState(defaultInstitution);
  const [grade, setGrade] = useState(3);
  const [planningType, setPlanningType] = useState<"unidad_mensual" | "secuencia_clases">(
    "unidad_mensual",
  );
  const [duration, setDuration] = useState("");
  const [startDate, setStartDate] = useState("");
  const [title, setTitle] = useState("");
  const [guidingQuestion, setGuidingQuestion] = useState("");
  const [teacherResource, setTeacherResource] = useState("");
  const [contents, setContents] = useState<SelectedContent[]>([]);

  const [sections, setSections] = useState<GeneratedSections | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const areas = countAreas(contents);

  function draft() {
    return {
      teacherName,
      institution,
      grade,
      planningType,
      duration,
      startDate,
      title,
      guidingQuestion,
      teacherResource,
      contents,
    };
  }

  function goNext() {
    setError(null);
    if (step === 0 && (!teacherName.trim() || !title.trim())) {
      return setError("Completá el nombre de la docente y un título preliminar.");
    }
    if (step === 1 && areas < 2) {
      return setError("Elegí contenidos de al menos dos áreas (la planificación es interdisciplinaria).");
    }
    if (step === 2 && guidingQuestion.trim().length < 10) {
      return setError("Escribí una pregunta motivadora (al menos 10 caracteres).");
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function onGenerate() {
    setError(null);
    setGenerating(true);
    const res = await generatePlan(draft());
    setGenerating(false);
    if (!res.ok) return setError(res.error);
    setSections(res.sections);
  }

  async function onSave() {
    setError(null);
    setSaving(true);
    const res = await savePlan(draft(), sections);
    setSaving(false);
    if (!res.ok) return setError(res.error);
    router.push(`/planificaciones/${res.planId}`);
    router.refresh();
  }

  return (
    <div>
      {/* Indicador de pasos */}
      <ol className="mb-6 grid grid-cols-4 gap-1" aria-label="Progreso">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className={`rounded-lg px-2 py-2 text-center text-xs font-semibold ${
              i === step
                ? "bg-brand text-white"
                : i < step
                  ? "bg-surface-2 text-brand"
                  : "bg-surface text-muted"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-danger-bg p-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* PASO 1 — DATOS */}
      {step === 0 && (
        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Docente">
            <input className={inputCls} value={teacherName} onChange={(e) => setTeacherName(e.target.value)} />
          </Field>
          <Field label="Institución">
            <input className={inputCls} value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Nombre de la escuela" />
          </Field>
          <Field label="Grado">
            <select className={inputCls} value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}.º grado
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tipo de planificación">
            <select
              className={inputCls}
              value={planningType}
              onChange={(e) => setPlanningType(e.target.value as typeof planningType)}
            >
              <option value="unidad_mensual">Unidad didáctica mensual</option>
              <option value="secuencia_clases">Secuencia de clases</option>
            </select>
          </Field>
          <Field label="Duración">
            <input className={inputCls} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ej.: 4 semanas o 5 clases" />
          </Field>
          <Field label="Fecha de inicio">
            <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Título preliminar">
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej.: Historias que viajan" />
            </Field>
          </div>
        </section>
      )}

      {/* PASO 2 — CONTENIDOS */}
      {step === 1 && (
        <section>
          <p className="mb-3 text-sm text-muted">
            Seleccionados: <strong>{contents.length}</strong> · Áreas:{" "}
            <strong className={areas >= 2 ? "text-brand" : "text-danger"}>{areas}</strong> (mínimo 2)
          </p>
          {contents.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {contents.map((c) => (
                <span key={c.id} className="flex max-w-full items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs">
                  <span className="truncate">
                    <strong>{c.area}:</strong> {c.contentText}
                  </span>
                  <button
                    type="button"
                    aria-label="Quitar"
                    className="text-danger"
                    onClick={() => setContents((prev) => prev.filter((x) => x.id !== c.id))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <ContentSelector key={grade} grade={grade} selected={contents} onChange={setContents} />
        </section>
      )}

      {/* PASO 3 — PREGUNTA Y RECURSOS */}
      {step === 2 && (
        <section className="grid gap-4">
          <Field label="Pregunta motivadora (hilo conductor)">
            <textarea
              className={`${inputCls} min-h-28`}
              value={guidingQuestion}
              onChange={(e) => setGuidingQuestion(e.target.value)}
              placeholder="Ej.: ¿Cómo podemos contar una historia para que otra persona pueda imaginarla?"
            />
          </Field>
          <Field label="Recurso que querés usar (opcional)">
            <textarea
              className={`${inputCls} min-h-24`}
              value={teacherResource}
              onChange={(e) => setTeacherResource(e.target.value)}
              placeholder="Un libro, una canción, una película, una salida, una noticia, un material concreto, un enlace…"
            />
          </Field>
        </section>
      )}

      {/* PASO 4 — PLANIFICACIÓN */}
      {step === 3 && (
        <section>
          {!sections ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-muted">
                La IA generará un borrador con las 10 secciones a partir de tu
                pregunta y contenidos. Vas a poder editar todo antes de guardar.
              </p>
              <Button size="lg" className="mt-4" onClick={onGenerate} disabled={generating}>
                {generating ? "Generando borrador…" : "Generar borrador con IA"}
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-3 rounded-lg bg-surface-2 p-3 text-sm text-muted">
                Borrador generado con IA. Revisalo y editalo: la decisión
                pedagógica final es tuya.
              </div>
              {(Object.keys(SECTION_LABELS) as (keyof GeneratedSections)[]).map((key) => (
                <details key={key} className="mb-2 overflow-hidden rounded-xl border border-border bg-surface" open={key === "titulo" || key === "actividades"}>
                  <summary className="cursor-pointer px-4 py-3 font-heading font-semibold text-brand">
                    {SECTION_LABELS[key]}
                  </summary>
                  <textarea
                    className="w-full border-t border-border bg-bg px-4 py-3 text-sm"
                    style={{ minHeight: key === "titulo" ? 48 : 160 }}
                    value={sections[key]}
                    onChange={(e) => setSections({ ...sections, [key]: e.target.value })}
                  />
                </details>
              ))}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={onSave} disabled={saving}>
                  {saving ? "Guardando…" : "Guardar planificación"}
                </Button>
                <button
                  type="button"
                  className="text-sm font-semibold text-muted hover:text-brand"
                  onClick={onGenerate}
                  disabled={generating}
                >
                  {generating ? "Regenerando…" : "Regenerar"}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Navegación */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          disabled={step === 0}
          className="text-sm font-semibold text-muted hover:text-brand disabled:opacity-40"
        >
          ← Volver
        </button>
        {step < STEPS.length - 1 && (
          <Button onClick={goNext}>Continuar →</Button>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-3 focus:border-brand-2";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}
