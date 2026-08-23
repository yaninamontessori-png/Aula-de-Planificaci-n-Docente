import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { buttonClasses } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Mis planificaciones" };

const tipoLabel: Record<string, string> = {
  unidad_mensual: "Unidad didáctica mensual",
  secuencia_clases: "Secuencia de clases",
};

const estadoLabel: Record<string, string> = {
  borrador: "Borrador",
  completo: "Completo",
};

export default async function PlanificacionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .maybeSingle();
  const isDirectivo = profile?.role === "directivo";

  // RLS decide el alcance: un directivo también ve las de su institución.
  const { data: plans, error } = await supabase
    .from("plans")
    .select("id, title, planning_type, grade, status, created_at, teacher_name, user_id")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-bold text-brand">
          {isDirectivo ? "Planificaciones de la institución" : "Mis planificaciones"}
        </h1>
        <Link href="/nueva" className={buttonClasses("primary", "md")}>
          + Nueva
        </Link>
      </div>

      {isDirectivo && (
        <p className="mt-2 text-sm text-muted">
          Como directivo/a, ves las planificaciones de las docentes de tu misma institución.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-danger-bg p-4 text-danger">
          No pudimos cargar las planificaciones. Revisá la configuración de Supabase e
          intentá de nuevo.
        </p>
      )}

      {!error && (!plans || plans.length === 0) && (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="font-heading text-lg font-bold text-ink">
            Todavía no hay planificaciones
          </p>
          <p className="mt-2 text-muted">
            Cuando se cree la primera, va a aparecer acá.
          </p>
          <Link href="/nueva" className={`${buttonClasses("primary", "lg")} mt-6`}>
            Crear la primera
          </Link>
        </div>
      )}

      {/* Vista docente: lista simple de sus planificaciones */}
      {!error && !isDirectivo && plans && plans.length > 0 && (
        <ul className="mt-6 space-y-3">
          {plans.map((p) => (
            <li key={p.id}>
              <Link
                href={`/planificaciones/${p.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-brand-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-heading text-lg font-bold text-ink">
                    {p.title}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {tipoLabel[p.planning_type] ?? p.planning_type} · {p.grade}.º grado ·{" "}
                    {estadoLabel[p.status] ?? p.status}
                  </p>
                </div>
                <span aria-hidden className="text-brand-2">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Vista directivo: agrupadas por curso (grado), con la maestra */}
      {!error && isDirectivo && plans && plans.length > 0 && (
        <div className="mt-6 space-y-8">
          {[1, 2, 3, 4, 5, 6, 7]
            .map((g) => ({ grade: g, items: plans.filter((p) => p.grade === g) }))
            .filter((group) => group.items.length > 0)
            .map(({ grade, items }) => (
              <section key={grade}>
                <div className="mb-3 flex items-center gap-3">
                  <h2 className="font-heading text-xl font-bold text-brand">
                    {grade}.º grado
                  </h2>
                  <span className="rounded-full bg-surface-2 px-3 py-0.5 text-xs font-semibold text-brand-ink">
                    {items.length} planificación{items.length > 1 ? "es" : ""}
                  </span>
                </div>
                <ul className="space-y-3">
                  {items.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/planificaciones/${p.id}`}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-brand-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-heading text-lg font-bold text-ink">
                            {p.title}
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            <span className="font-semibold text-brand-ink">
                              {p.teacher_name}
                            </span>{" "}
                            · {tipoLabel[p.planning_type] ?? p.planning_type} ·{" "}
                            {estadoLabel[p.status] ?? p.status}
                          </p>
                        </div>
                        <span aria-hidden className="text-brand-2">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
