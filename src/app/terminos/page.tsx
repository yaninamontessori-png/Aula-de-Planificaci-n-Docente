import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Términos" };

export default function TerminosPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
      <Link href="/" className="text-sm font-semibold text-muted hover:text-brand">
        ← Inicio
      </Link>
      <h1 className="mt-4 font-heading text-3xl font-bold text-brand">Términos de uso</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-ink">
        <p>
          Esta herramienta ofrece asistencia para elaborar borradores de planificación.
          Los textos generados con inteligencia artificial son un punto de partida: la
          decisión pedagógica final siempre queda en manos de la docente.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Usá la aplicación con fines educativos y profesionales.</li>
          <li>Revisá y adaptá cada borrador antes de utilizarlo en el aula.</li>
          <li>No incorpores datos personales de estudiantes.</li>
        </ul>
        <p className="text-sm text-muted">
          Este texto es una versión base y debe ser revisada por la institución antes de
          su publicación definitiva.
        </p>
      </div>
    </main>
  );
}
