"use client";

import { useState } from "react";
import Link from "next/link";
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

const EJEMPLOS = [
  "¿Cómo podemos contar una historia para que otra persona pueda imaginarla?",
  "¿Por qué cambian los seres vivos con el paso del tiempo?",
  "¿Qué historias esconde el lugar donde vivimos?",
];

export function Wizard({
  defaultTeacherName,
  defaultInstitution,
  defaultGrade,
  skillsCount,
}: {
  defaultTeacherName: string;
  defaultInstitution: string;
  defaultGrade: number;
  skillsCount: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Identidad de la docente: se carga UNA vez en el Perfil, no acá.
  const teacherName = defaultTeacherName;
  const institution = defaultInstitution;

  const [grade, setGrade] = useState(defaultGrade);
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
  const [editingKey, setEditingKey] = useState<keyof GeneratedSections | null>(null);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);

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

  // Navegación libre: nunca bloquea. Se puede saltar a cualquier paso y corregir.
  function goTo(i: number) {
    setError(null);
    setStep(Math.max(0, Math.min(i, STEPS.length - 1)));
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
    setSavedPlanId(res.planId);
  }

  if (savedPlanId) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-surface px-6 py-16 text-center">
        <span className="pointer-events-none absolute left-10 top-16 h-3 w-3 rotate-12 rounded-sm bg-[#f3b7a1]" />
        <span className="pointer-events-none absolute right-14 top-24 h-2.5 w-2.5 -rotate-12 rounded-sm bg-[#a9d0b8]" />
        <span className="pointer-events-none absolute left-20 top-32 h-3.5 w-3.5 rotate-45 rounded-sm bg-[#f2d590]" />
        <span className="pointer-events-none absolute right-24 top-40 h-2.5 w-2.5 rounded-sm bg-[#cdbef0]" />
        <span className="pointer-events-none absolute right-10 top-28 h-3 w-3 rotate-45 rounded-sm bg-[#f3b7a1]" />
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-ink">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1 className="relative mt-6 font-heading text-3xl font-extrabold text-ink">
          ¡Tu planificación está lista!
        </h1>
        <p className="relative mx-auto mt-3 max-w-sm text-muted">
          La guardamos en «Mis planificaciones». Podés seguir editándola cuando quieras.
        </p>
        <div className="relative mx-auto mt-8 flex max-w-xs flex-col gap-3">
          <Button
            size="lg"
            onClick={() => {
              router.push(`/planificaciones/${savedPlanId}`);
              router.refresh();
            }}
          >
            Ver mi planificación
          </Button>
          <button
            type="button"
            className="rounded-full bg-surface-2 px-6 py-3 font-bold text-brand-ink transition-colors hover:bg-accent-2"
            onClick={() => {
              setSavedPlanId(null);
              setSections(null);
              setContents([]);
              setGuidingQuestion("");
              setTeacherResource("");
              setTitle("");
              setStep(0);
            }}
          >
            Crear otra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Indicador de pasos — tocable, para moverse y corregir libremente */}
      <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Progreso">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === step ? "step" : undefined}
              className={`flex w-full items-center justify-center gap-2 rounded-full px-2 py-2.5 text-center text-xs font-bold transition-colors ${
                i === step
                  ? "bg-brand text-white"
                  : i < step
                    ? "bg-accent-2 text-accent-ink hover:bg-accent"
                    : "bg-surface text-muted hover:text-ink"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  i === step
                    ? "bg-white/25"
                    : i < step
                      ? "bg-brand text-white"
                      : "bg-surface-2 text-muted"
                }`}
              >
                {i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-danger-bg p-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      {/* PASO 1 — DATOS (identidad ya cargada; acá solo el curso y el plan) */}
      {step === 0 && (
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-accent px-4 py-3 text-sm text-accent-ink">
            <span>
              Planificás como <strong>{teacherName || "—"}</strong>
              {institution ? <> · {institution}</> : null}
            </span>
            <Link href="/perfil" className="font-bold text-brand-ink underline">
              Editar en Perfil
            </Link>
          </div>
          <p className="mb-4 text-sm text-muted">
            Tus datos ya están cargados. Acá elegís el curso y arrancás — podés moverte entre
            los pasos y corregir cuando quieras.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="sm:col-span-2">
              <Field label="Título preliminar">
                <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej.: Historias que viajan" />
              </Field>
            </div>
            <Field label={<>Duración <span className="font-normal text-muted">· opcional</span></>}>
              <input className={inputCls} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ej.: 4 semanas o 5 clases" />
            </Field>
            <Field label={<>Fecha de inicio <span className="font-normal text-muted">· opcional</span></>}>
              <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
          </div>
        </section>
      )}

      {/* PASO 2 — CONTENIDOS */}
      {step === 1 && (
        <section>
          <div
            className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${
              areas >= 2
                ? "bg-accent-2 text-accent-ink"
                : contents.length > 0
                  ? "bg-[#fbeecb] text-[#8a6412]"
                  : "bg-surface-2 text-muted"
            }`}
          >
            {areas >= 2
              ? `¡Genial! Ya tenés ${areas} áreas: tu planificación es interdisciplinaria.`
              : contents.length > 0
                ? "Llevás contenidos de 1 área. Sumá otra área y tu planificación será interdisciplinaria."
                : "Elegí contenidos. Con 2 áreas distintas ya es interdisciplinaria."}
            <span className="ml-1 font-normal">
              (seleccionados: {contents.length})
            </span>
          </div>
          {contents.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {contents.map((c) => (
                <span key={c.id} className="flex max-w-full items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-xs">
                  <span className="truncate">
                    <strong>{c.area}:</strong> {c.contentText}
                  </span>
                  <button
                    type="button"
                    aria-label="Quitar"
                    className="text-danger"
                    onClick={() => setContents((prev) => prev.filter((x) => x.id !== c.id))}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
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
          <div className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-brand-ink">
            Una buena pregunta suele empezar con «¿Cómo…?» o «¿Por qué…?» e invita a
            investigar. Escribí la tuya o tocá un ejemplo.
          </div>
          <Field label="Tu pregunta motivadora (hilo conductor)">
            <textarea
              className={`${inputCls} min-h-28`}
              value={guidingQuestion}
              onChange={(e) => setGuidingQuestion(e.target.value)}
              placeholder="Escribí tu pregunta acá…"
            />
          </Field>
          <div>
            <p className="mb-2 text-sm font-bold text-ink">Ejemplos para inspirarte (tocá para usar)</p>
            <div className="flex flex-col gap-2">
              {EJEMPLOS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setGuidingQuestion(q)}
                  className="flex items-start gap-2 rounded-xl border-2 border-dashed border-border bg-surface px-4 py-3 text-left text-sm text-brand-ink transition-colors hover:border-brand"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-brand">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                  {q}
                </button>
              ))}
            </div>
          </div>
          <Field label={<>Recurso que querés usar <span className="font-normal text-muted">· opcional</span></>}>
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
            <div className="rounded-2xl border-2 border-border bg-surface p-6">
              <p className="text-muted">
                Con tu pregunta y tus contenidos vamos a armar un borrador con las 10
                secciones. Después vas a poder editar todo antes de guardar.
              </p>
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-accent-2 px-3 py-2.5 text-sm text-accent-ink">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1M7.7 16.3l-2.1 2.1" />
                </svg>
                {skillsCount > 0 ? (
                  <span>
                    Se aplicarán los <strong>{skillsCount} enfoques</strong> que configuraste en tu{" "}
                    <Link href="/perfil" className="font-bold underline">
                      Perfil
                    </Link>
                    .
                  </span>
                ) : (
                  <span>
                    En tu{" "}
                    <Link href="/perfil" className="font-bold underline">
                      Perfil
                    </Link>{" "}
                    podés activar enfoques (ESI, ambiental, inclusión…) para que la IA los use
                    siempre.
                  </span>
                )}
              </p>
              <Button size="lg" className="mt-4" onClick={onGenerate} disabled={generating}>
                {generating ? "Generando borrador…" : "Generar borrador con IA"}
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-start gap-3 rounded-2xl bg-accent p-4 text-sm text-accent-ink">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>
                  ¡Listo! Borrador generado con IA. Revisalo y editalo: la decisión pedagógica
                  final es tuya.
                </span>
              </div>
              <div className="space-y-2">
                {(Object.keys(SECTION_LABELS) as (keyof GeneratedSections)[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setEditingKey(key)}
                    className="flex w-full items-center gap-3 rounded-2xl border-2 border-border bg-surface px-4 py-3 text-left transition-colors hover:border-accent"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading text-sm font-bold text-ink">
                        {SECTION_LABELS[key]}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {sections[key]?.trim() || "Tocá para escribir…"}
                      </span>
                    </span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brand">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={onSave} disabled={saving}>
                  {saving ? "Guardando…" : "Guardar planificación"}
                </Button>
                <button
                  type="button"
                  className="text-sm font-bold text-muted hover:text-brand"
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
          onClick={() => goTo(step - 1)}
          disabled={step === 0}
          className="text-sm font-bold text-muted hover:text-brand disabled:opacity-40"
        >
          ← Volver
        </button>
        {step < STEPS.length - 1 && <Button onClick={() => goTo(step + 1)}>Continuar →</Button>}
      </div>

      {/* Hoja de edición a pantalla completa */}
      {editingKey && sections && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <button
              type="button"
              onClick={() => setEditingKey(null)}
              aria-label="Volver"
              className="flex items-center gap-1 text-sm font-bold text-muted hover:text-brand"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className="font-heading text-sm font-bold text-ink">
              {SECTION_LABELS[editingKey]}
            </span>
            <Button size="md" onClick={() => setEditingKey(null)}>
              Listo
            </Button>
          </div>
          <textarea
            autoFocus
            className="mx-auto w-full max-w-2xl flex-1 resize-none bg-bg px-5 py-5 text-base leading-relaxed focus:outline-none"
            value={sections[editingKey]}
            onChange={(e) => setSections({ ...sections, [editingKey]: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-3 focus:border-brand-2";

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}
