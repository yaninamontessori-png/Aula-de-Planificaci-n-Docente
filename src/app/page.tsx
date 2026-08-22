import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

const pasos = [
  {
    n: "1",
    t: "Datos",
    d: "Grado, tipo de planificación, duración y un título para empezar.",
    card: "bg-[#fbe3d8]",
    num: "bg-[#f3b7a1]",
  },
  {
    n: "2",
    t: "Contenidos",
    d: "Tocá los contenidos oficiales del Diseño Curricular de Santa Fe.",
    card: "bg-[#dcebe0]",
    num: "bg-[#a9d0b8]",
  },
  {
    n: "3",
    t: "Pregunta",
    d: "La pregunta motivadora que será el hilo conductor.",
    card: "bg-[#fbeecb]",
    num: "bg-[#f2d590]",
  },
  {
    n: "4",
    t: "Planificación",
    d: "Un borrador interdisciplinario editable, listo para descargar.",
    card: "bg-[#ece7f8]",
    num: "bg-[#cdbef0]",
  },
];

function BookMark() {
  return (
    <span className="flex h-9 w-9 -rotate-6 items-center justify-center rounded-xl bg-brand">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16h5.5A2.5 2.5 0 0 1 20 21.5z" />
      </svg>
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.8h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6C4.8 19.8 8.1 22 12 22Z" />
      <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1C2.4 8.8 2 10.4 2 12s.4 3.2 1.1 4.6L6.4 14Z" />
      <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2 8.1 2 4.8 4.2 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1Z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6">
        <span className="flex items-center gap-3 font-heading text-lg font-bold text-ink">
          <BookMark />
          Aula de Planificación
        </span>
        <Link href="/login" className={buttonClasses("primary", "md")}>
          Ingresar
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5">
        {/* Hero — panel salvia */}
        <section className="relative mt-2 overflow-hidden rounded-[2rem] bg-accent px-8 py-12 text-accent-ink sm:px-12 sm:py-14">
          <span className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#f4d89e]" />
          <span className="pointer-events-none absolute -bottom-12 right-40 h-32 w-32 rounded-full bg-[#f3b7a1]" />
          <span className="relative inline-flex -rotate-2 items-center gap-2 rounded-full bg-[#fbeecb] px-4 py-2 text-sm font-bold text-brand-ink">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 3 7l9 5 9-5-9-5Z" />
              <path d="M3 12l9 5 9-5" />
            </svg>
            Educación Primaria · Santa Fe
          </span>
          <h1 className="relative mt-6 max-w-3xl font-heading text-4xl font-extrabold leading-[1.05] sm:text-5xl">
            Una pregunta. Y tu{" "}
            <span className="rounded-lg bg-[#fbeecb] px-2 [box-decoration-break:clone]">
              planificación completa.
            </span>
          </h1>
          <p className="relative mt-5 max-w-xl text-lg leading-relaxed">
            Elegí contenidos oficiales, escribí tu pregunta motivadora y recibí un borrador
            ordenado y listo para editar. La decisión pedagógica final siempre es tuya.
          </p>
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-bg px-7 py-4 text-base font-bold text-ink transition-colors hover:bg-white"
            >
              <GoogleIcon />
              Continuar con Google
            </Link>
            <Link
              href="/privacidad"
              className="inline-flex items-center justify-center rounded-full border-2 border-accent-ink/35 px-6 py-4 text-base font-bold text-accent-ink transition-colors hover:border-accent-ink/60"
            >
              Cómo cuidamos tus datos
            </Link>
          </div>
          <p className="relative mt-5 flex items-center gap-2 text-sm opacity-90">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 4 6v6c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V6l-8-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Sin contraseñas nuevas · cada docente ve solo sus planificaciones
          </p>
        </section>

        {/* Pasos */}
        <section aria-label="Cómo funciona" className="py-14">
          <div className="flex items-end justify-between">
            <h2 className="font-heading text-2xl font-bold text-ink sm:text-3xl">
              Cuatro pasos, listo
            </h2>
            <span className="text-sm font-semibold text-muted">de la idea al borrador</span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pasos.map((p) => (
              <article key={p.n} className={`rounded-3xl p-6 ${p.card}`}>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl font-heading text-lg font-bold text-ink ${p.num}`}
                >
                  {p.n}
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold text-ink">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-ink/80">{p.d}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-muted">
          <span>© {new Date().getFullYear()} Aula de Planificación Docente</span>
          <div className="flex gap-5">
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
