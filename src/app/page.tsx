import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

const pasos = [
  {
    n: "1",
    t: "Datos",
    d: "Grado, tipo de planificación, duración y título preliminar.",
  },
  {
    n: "2",
    t: "Contenidos",
    d: "Elegí contenidos oficiales del Diseño Curricular de Santa Fe.",
  },
  {
    n: "3",
    t: "Pregunta y recursos",
    d: "Definí la pregunta motivadora que será el hilo conductor.",
  },
  {
    n: "4",
    t: "Planificación",
    d: "Un borrador interdisciplinario editable, listo para descargar.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <span className="font-heading text-lg font-bold text-brand">
          Aula de Planificación Docente
        </span>
        <Link href="/login" className={buttonClasses("primary", "md")}>
          Ingresar
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5">
        <section className="py-12 sm:py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
            Educación Primaria · Santa Fe
          </p>
          <h1 className="max-w-2xl font-heading text-4xl font-bold leading-tight text-brand sm:text-5xl">
            De una pregunta motivadora a una planificación interdisciplinaria.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Seleccioná contenidos curriculares oficiales, escribí tu pregunta motivadora y
            generá un borrador estructurado y editable. La decisión pedagógica final
            siempre queda en tus manos.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className={buttonClasses("primary", "lg")}>
              Continuar con Google
            </Link>
            <Link href="/privacidad" className={buttonClasses("ghost", "lg")}>
              Cómo cuidamos tus datos
            </Link>
          </div>
        </section>

        <section aria-label="Recorrido" className="grid gap-4 pb-16 sm:grid-cols-2">
          {pasos.map((p) => (
            <article
              key={p.n}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 font-heading font-bold text-brand">
                {p.n}
              </span>
              <h2 className="mt-4 font-heading text-xl font-bold text-brand">{p.t}</h2>
              <p className="mt-2 text-muted">{p.d}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-muted">
          <span>© {new Date().getFullYear()} Aula de Planificación Docente</span>
          <div className="flex gap-4">
            <Link href="/privacidad" className="hover:text-brand">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-brand">
              Términos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
