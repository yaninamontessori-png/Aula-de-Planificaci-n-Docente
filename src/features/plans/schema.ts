/**
 * Esquemas de validación del dominio "planificación".
 * Son las funciones críticas que se comparten entre el formulario, el servidor
 * y la Edge Function de IA. Están cubiertas por tests en schema.test.ts.
 */
import { z } from "zod";

export const GRADES = [1, 2, 3, 4, 5, 6, 7] as const;

export const planningTypeSchema = z.enum(["unidad_mensual", "secuencia_clases"]);

/** Contenido curricular tal como se selecciona en el Paso 2. */
export const selectedContentSchema = z.object({
  id: z.string().uuid(),
  area: z.string().min(1),
  axis: z.string().nullable().optional(),
  contentNumber: z.string().nullable().optional(),
  contentText: z.string().min(1),
});
export type SelectedContent = z.infer<typeof selectedContentSchema>;

/** Cantidad de áreas distintas dentro de una selección de contenidos. */
export function countAreas(contents: Pick<SelectedContent, "area">[]): number {
  return new Set(contents.map((c) => c.area.trim()).filter(Boolean)).size;
}

/** La planificación siempre es interdisciplinaria: exige ≥ 2 áreas. */
export function isInterdisciplinary(contents: Pick<SelectedContent, "area">[]): boolean {
  return countAreas(contents) >= 2;
}

/** Datos del borrador que la docente arma en los pasos 1–3. */
export const planDraftSchema = z
  .object({
    teacherName: z.string().trim().min(1, "Ingresá el nombre de la docente."),
    institution: z.string().trim().max(200).optional().default(""),
    grade: z.coerce.number().int().min(1).max(7),
    planningType: planningTypeSchema,
    duration: z.string().trim().max(120).optional().default(""),
    startDate: z
      .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")])
      .default(""),
    title: z.string().trim().min(1, "Ingresá un título preliminar."),
    guidingQuestion: z
      .string()
      .trim()
      .min(10, "La pregunta motivadora debe tener al menos 10 caracteres."),
    teacherResource: z.string().trim().max(2000).optional().default(""),
    contents: z.array(selectedContentSchema).min(1, "Seleccioná al menos un contenido."),
  })
  .superRefine((data, ctx) => {
    if (!isInterdisciplinary(data.contents)) {
      ctx.addIssue({
        code: "custom",
        path: ["contents"],
        message:
          "La planificación debe ser interdisciplinaria: elegí contenidos de al menos dos áreas.",
      });
    }
  });
export type PlanDraft = z.infer<typeof planDraftSchema>;

/** Secciones que devuelve y valida la IA. */
export const generatedSectionsSchema = z.object({
  titulo: z.string().min(1),
  fundamentacion: z.string().min(1),
  propositos: z.string().min(1),
  objetivos: z.string().min(1),
  actividades: z.string().min(1),
  producto_final: z.string().min(1),
  recursos: z.string().min(1),
  evaluacion: z.string().min(1),
  adecuaciones: z.string().min(1),
  cierre_reflexivo: z.string().min(1),
});
export type GeneratedSections = z.infer<typeof generatedSectionsSchema>;

export const SECTION_LABELS: Record<keyof GeneratedSections, string> = {
  titulo: "Título",
  fundamentacion: "Fundamentación",
  propositos: "Propósitos",
  objetivos: "Objetivos",
  actividades: "Actividades y progresión",
  producto_final: "Producto final",
  recursos: "Recursos",
  evaluacion: "Evaluación formativa",
  adecuaciones: "Atención a la diversidad",
  cierre_reflexivo: "Cierre reflexivo",
};
