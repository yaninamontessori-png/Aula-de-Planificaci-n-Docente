import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nueva planificación" };

const pasos = [
  {
    n: "1",
    t: "Datos",
    d: "Docente, institución, grado, tipo, duración, fecha y título.",
  },
  {
    n: "2",
    t: "Contenidos",
    d: "Contenidos oficiales por grado, con áreas, ejes, buscador y contador.",
  },
  {
    n: "3",
    t: "Pregunta y recursos",
    d: "Pregunta motivadora y recurso elegido por la docente.",
  },
  { n: "4", t: "Planificación", d: "Borrador generado con IA, editable y descargable." },
];

export default function NuevaPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-muted">
        Paso a paso
      </p>
      <h1 className="mt-1 font-heading text-3xl font-bold text-brand">
        Nueva planificación
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Estás autenticada y la navegación protegida funciona. El asistente de cuatro pasos
        se conecta en la próxima entrega, junto con la generación con IA y las descargas.
      </p>

      <ol className="mt-8 space-y-3">
        {pasos.map((p) => (
          <li
            key={p.n}
            className="flex gap-4 rounded-2xl border border-border bg-surface p-5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 font-heading font-bold text-brand">
              {p.n}
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-ink">{p.t}</h2>
              <p className="text-muted">{p.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
