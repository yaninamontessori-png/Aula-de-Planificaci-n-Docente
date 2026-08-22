import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Detalle de planificación" };

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS garantiza que solo se devuelva si la planificación es de la docente.
  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!plan) notFound();

  return (
    <div>
      <Link
        href="/planificaciones"
        className="text-sm font-semibold text-muted hover:text-brand"
      >
        ← Mis planificaciones
      </Link>
      <h1 className="mt-3 font-heading text-3xl font-bold text-brand">{plan.title}</h1>
      <p className="mt-2 text-muted">{plan.guiding_question}</p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <p className="text-muted">
          La vista de edición completa (secciones editables, duplicar, eliminar y
          descargas Word/PDF) llega en la próxima entrega.
        </p>
      </div>
    </div>
  );
}
