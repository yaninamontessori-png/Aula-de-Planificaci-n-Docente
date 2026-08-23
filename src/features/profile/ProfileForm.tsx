"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileActionState } from "./actions";
import { Button } from "@/components/ui/Button";
import { GRADES, TEACHING_SKILLS, TEACHER_SUBJECTS } from "@/features/plans/schema";

export function ProfileForm({
  email,
  displayName,
  institution,
  defaultGrade,
  role,
  subject,
  skills,
  notes,
}: {
  email: string;
  displayName: string;
  institution: string;
  defaultGrade: number | null;
  role: string;
  subject: string;
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
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="teaching_subject">
              Especialidad
            </label>
            <select
              id="teaching_subject"
              name="teaching_subject"
              defaultValue={subject || "grado"}
              className="w-full rounded-xl border border-border bg-surface px-3 py-3"
            >
              {TEACHER_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="role">
              Rol
            </label>
            <select
              id="role"
              name="role"
              defaultValue={role || "docente"}
              className="w-full rounded-xl border border-border bg-surface px-3 py-3"
            >
              <option value="docente">Docente</option>
              <option value="directivo">Directivo/a</option>
            </select>
            <p className="mt-1 text-xs text-muted">
              Directivo/a ve las planificaciones de su institución.
            </p>
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
