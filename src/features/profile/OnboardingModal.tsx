"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding, type ProfileActionState } from "./actions";
import { Button } from "@/components/ui/Button";
import { GRADES, TEACHER_SUBJECTS } from "@/features/plans/schema";

const inputCls = "w-full rounded-xl border border-border bg-surface px-3 py-3";

/**
 * Modal de bienvenida (primera vez). Completa el perfil esencial y marca
 * onboarded. Es bloqueante: la docente empieza cargando sus datos una vez.
 */
export function OnboardingModal({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ProfileActionState, FormData>(
    completeOnboarding,
    {},
  );

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
    >
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-6 sm:rounded-3xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <h1 id="onboarding-title" className="text-center font-heading text-2xl font-extrabold text-ink">
          ¡Te damos la bienvenida!
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-center text-sm text-muted">
          Completá tus datos una sola vez. La app los usa para precargar y
          personalizar tus planificaciones.
        </p>

        <form action={action} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Tu nombre</span>
            <input name="display_name" defaultValue={defaultName} required className={inputCls} />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Institución</span>
            <input name="institution" placeholder="Nombre de la escuela" className={inputCls} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold">Grado</span>
              <select name="default_grade" defaultValue="" className={inputCls}>
                <option value="">—</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}.º
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold">Especialidad</span>
            <select name="teaching_subject" defaultValue="grado" className={inputCls}>
              {TEACHER_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          {state.error && (
            <p role="alert" className="text-sm font-bold text-danger">
              {state.error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Guardando…" : "Comenzar"}
          </Button>
          <p className="text-center text-xs text-muted">
            Vas a poder ajustar todo esto más adelante en tu Perfil.
          </p>
        </form>
      </div>
    </div>
  );
}
