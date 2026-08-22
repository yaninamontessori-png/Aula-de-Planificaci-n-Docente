"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileActionState } from "./actions";
import { Button } from "@/components/ui/Button";
import { GRADES, TEACHING_SKILLS } from "@/features/plans/schema";

export function ProfileForm({
  email,
  displayName,
  institution,
  defaultGrade,
  skills,
  notes,
}: {
  email: string;
  displayName: string;
  institution: string;
  defaultGrade: number | null;
  skills: string[];
  notes: string;
}) {
  const [state, action, pending] = useActionState<ProfileActionState, FormData>(
    updateProfile,
    {},
  );
  const active = new Set(skills);

  return (
    <form action={action} className="mt-6 space-y-6">
      {/* Datos de la docente */}
      <section className="space-y-5 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-heading text-lg font-bold text-ink">Tus datos</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-bold" htmlFor="email">
              Correo
            </label>
            <input
              id="email"
              value={email}
              readOnly
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-3 text-muted"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="display_name">
              Nombre visible
            </label>
            <input
              id="display_name"
              name="display_name"
              defaultValue={displayName}
              required
              className="w-full rounded-xl border border-border bg-surface px-3 py-3"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="default_grade">
              Grado que enseñás
            </label>
            <select
              id="default_grade"
              name="default_grade"
              defaultValue={defaultGrade ?? ""}
              className="w-full rounded-xl border border-border bg-surface px-3 py-3"
            >
              <option value="">Sin especificar</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}.º grado
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-bold" htmlFor="institution">
              Institución
            </label>
            <input
              id="institution"
              name="institution"
              defaultValue={institution}
              placeholder="Nombre de la escuela"
              className="w-full rounded-xl border border-border bg-surface px-3 py-3"
            />
          </div>
        </div>
      </section>

      {/* Enfoques del agente de IA */}
      <section className="space-y-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <h2 className="font-heading text-lg font-bold text-ink">
            Enfoques para tus planificaciones
          </h2>
          <p className="mt-1 text-sm text-muted">
            Elegí cómo querés que la IA arme tus borradores. Se aplican a{" "}
            <strong>todas</strong> las planificaciones que generes — los configurás una sola
            vez acá.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {TEACHING_SKILLS.map((s) => {
            const on = active.has(s.id);
            return (
              <label
                key={s.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors ${
                  on ? "border-accent bg-accent-2" : "border-border bg-surface hover:border-accent"
                }`}
              >
                <input
                  type="checkbox"
                  name="skills"
                  value={s.id}
                  defaultChecked={on}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-brand)]"
                />
                <span>
                  <span className="block text-sm font-bold text-ink">{s.label}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted">{s.short}</span>
                </span>
              </label>
            );
          })}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold" htmlFor="pedagogical_notes">
            Contexto de tu grupo <span className="font-normal text-muted">· opcional</span>
          </label>
          <textarea
            id="pedagogical_notes"
            name="pedagogical_notes"
            defaultValue={notes}
            maxLength={600}
            placeholder="Ej.: plurigrado rural; grupo numeroso; hay estudiantes con apoyos; priorizamos la lectura en voz alta…"
            className="min-h-24 w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm leading-relaxed"
          />
          <p className="mt-1.5 text-xs text-muted">
            La IA lo tiene en cuenta al planificar, sin nombrar ni diagnosticar estudiantes.
          </p>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </Button>
        {state.ok && (
          <span role="status" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Perfil actualizado
          </span>
        )}
        {state.error && (
          <span role="alert" className="text-sm font-bold text-danger">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
