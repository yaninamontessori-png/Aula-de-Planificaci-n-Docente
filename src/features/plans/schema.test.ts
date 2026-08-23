import { describe, it, expect } from "vitest";
import {
  countAreas,
  isInterdisciplinary,
  planDraftSchema,
  generatedSectionsSchema,
} from "./schema";

const contenido = (id: string, area: string) => ({
  id,
  area,
  contentText: "Contenido de ejemplo",
});

const uuid = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;

describe("interdisciplinariedad", () => {
  it("cuenta áreas distintas", () => {
    expect(
      countAreas([contenido(uuid(1), "Matemática"), contenido(uuid(2), "Matemática")]),
    ).toBe(1);
    expect(
      countAreas([contenido(uuid(1), "Matemática"), contenido(uuid(2), "Lengua")]),
    ).toBe(2);
  });

  it("requiere al menos dos áreas", () => {
    expect(isInterdisciplinary([contenido(uuid(1), "Matemática")])).toBe(false);
    expect(
      isInterdisciplinary([
        contenido(uuid(1), "Matemática"),
        contenido(uuid(2), "Lengua"),
      ]),
    ).toBe(true);
  });
});

describe("planDraftSchema", () => {
  const base = {
    teacherName: "Ana Docente",
    grade: 3,
    planningType: "unidad_mensual" as const,
    title: "Historias que viajan",
    guidingQuestion: "¿Cómo contamos una historia para que otra persona la imagine?",
  };

  it("acepta una selección de una sola área (interdisciplina optativa)", () => {
    const res = planDraftSchema.safeParse({
      ...base,
      contents: [contenido(uuid(1), "Lengua y Literatura")],
    });
    expect(res.success).toBe(true);
  });

  it("acepta contenidos de dos áreas", () => {
    const res = planDraftSchema.safeParse({
      ...base,
      contents: [
        {
          ...contenido(uuid(1), "Lengua y Literatura"),
          contentText: "Escucha comprensiva.",
        },
        {
          ...contenido(uuid(2), "Ciencias Sociales"),
          contentText: "Diversidad de trabajos.",
        },
      ],
    });
    expect(res.success).toBe(true);
  });

  it("rechaza grado fuera de rango", () => {
    const res = planDraftSchema.safeParse({
      ...base,
      grade: 9,
      contents: [
        contenido(uuid(1), "Lengua y Literatura"),
        contenido(uuid(2), "Matemática"),
      ],
    });
    expect(res.success).toBe(false);
  });
});

describe("generatedSectionsSchema", () => {
  it("rechaza secciones incompletas de la IA", () => {
    const res = generatedSectionsSchema.safeParse({ titulo: "x" });
    expect(res.success).toBe(false);
  });

  it("acepta las diez secciones completas", () => {
    const full = Object.fromEntries(
      [
        "titulo",
        "fundamentacion",
        "propositos",
        "objetivos",
        "actividades",
        "producto_final",
        "recursos",
        "evaluacion",
        "adecuaciones",
        "cierre_reflexivo",
      ].map((k) => [k, "contenido"]),
    );
    expect(generatedSectionsSchema.safeParse(full).success).toBe(true);
  });
});
