/**
 * Esquemas de validación del dominio "planificación".
 * Son las funciones críticas que se comparten entre el formulario, el servidor
 * y la Edge Function de IA. Están cubiertas por tests en schema.test.ts.
 */
import { z } from "zod";

export const GRADES = [1, 2, 3, 4, 5, 6, 7] as const;

/**
 * Enfoques pedagógicos ("skills" del agente de IA).
 * La docente los activa en su Perfil y se inyectan como instrucciones al generar.
 *   - `label` / `short`: para la interfaz.
 *   - `prompt`: la instrucción que recibe el modelo cuando el enfoque está activo.
 */
export const TEACHING_SKILLS = [
  {
    id: "esi",
    label: "ESI · Educación Sexual Integral",
    short: "Cuidado del cuerpo, emociones, respeto y diversidad, según la edad.",
    prompt:
      "Integrá la Educación Sexual Integral (ESI) de forma transversal y apropiada a la edad: cuidado del cuerpo, expresión de emociones, respeto por la diversidad y vínculos saludables.",
  },
  {
    id: "eai",
    label: "Educación Ambiental",
    short: "Cuidado del ambiente y vínculo con el entorno local.",
    prompt:
      "Integrá la Educación Ambiental Integral (EAI): cuidado del ambiente, consumo responsable y vínculo con el entorno local.",
  },
  {
    id: "ecd",
    label: "Ciudadanía y Derechos",
    short: "Convivencia democrática y derechos de niñas y niños.",
    prompt:
      "Integrá la Educación en Ciudadanía y Derechos (ECD): convivencia democrática, derechos de niñas y niños y participación.",
  },
  {
    id: "ei",
    label: "Interculturalidad",
    short: "Reconocer y valorar la diversidad cultural del aula.",
    prompt:
      "Integrá una perspectiva intercultural (EI): reconocimiento y valoración de la diversidad cultural del aula y la comunidad.",
  },
  {
    id: "dua",
    label: "Inclusión (DUA)",
    short: "Diseño Universal: múltiples formas de acceder y participar.",
    prompt:
      "Aplicá el Diseño Universal para el Aprendizaje (DUA): ofrecé múltiples formas de representación, de acción y expresión, y de implicación, con consignas multinivel.",
  },
  {
    id: "abp",
    label: "Aprendizaje por proyectos",
    short: "Un proyecto con producto final auténtico y su socialización.",
    prompt:
      "Estructurá la propuesta como Aprendizaje Basado en Proyectos (ABP), con un producto final auténtico y su socialización con la comunidad.",
  },
  {
    id: "ludico",
    label: "Juego y ludificación",
    short: "El juego como estrategia central de enseñanza.",
    prompt:
      "Priorizá el juego y las dinámicas lúdicas como estrategia central de enseñanza.",
  },
  {
    id: "cooperativo",
    label: "Trabajo cooperativo",
    short: "Grupos pequeños con roles y objetivos compartidos.",
    prompt:
      "Privilegiá el trabajo cooperativo en pequeños grupos, con roles definidos e interdependencia positiva.",
  },
  {
    id: "concreto",
    label: "Material concreto",
    short: "Aprender con materiales manipulables y exploración.",
    prompt:
      "Apoyá los aprendizajes en materiales concretos y manipulables y en la exploración autónoma.",
  },
  {
    id: "tic",
    label: "Tecnología educativa",
    short: "Herramientas digitales al servicio del objetivo.",
    prompt:
      "Integrá tecnologías digitales de manera pedagógica (buscar, producir y comunicar) cuando aporten al objetivo.",
  },
] as const;

export type TeachingSkillId = (typeof TEACHING_SKILLS)[number]["id"];
export const TEACHING_SKILL_IDS: readonly string[] = TEACHING_SKILLS.map((s) => s.id);

/** Solo ids válidos del catálogo (descarta cualquier valor desconocido). */
export function normalizeSkillIds(ids: string[]): string[] {
  const valid = new Set(TEACHING_SKILL_IDS);
  return [...new Set(ids)].filter((id) => valid.has(id));
}

/** Instrucciones para el modelo a partir de los ids elegidos. */
export function skillPromptsFor(ids: string[]): string[] {
  const chosen = new Set(ids);
  return TEACHING_SKILLS.filter((s) => chosen.has(s.id)).map((s) => s.prompt);
}

/** Roles de la cuenta. El directivo puede ver las planificaciones de su institución. */
export const ROLES = ["docente", "directivo"] as const;
export type Role = (typeof ROLES)[number];

/**
 * Especialidad de la docente (maestra de grado o docente especial).
 * Orienta a la IA sobre el enfoque de la propuesta.
 */
export const TEACHER_SUBJECTS = [
  { id: "grado", label: "Maestra/o de grado", prompt: "" },
  {
    id: "musica",
    label: "Música",
    prompt:
      "La docente es especialista en Educación Musical: encará la propuesta desde la música (escucha, exploración sonora, ritmo, canto, ejecución instrumental) integrando los contenidos seleccionados.",
  },
  {
    id: "educacion_fisica",
    label: "Educación Física",
    prompt:
      "La docente es especialista en Educación Física: encará la propuesta desde lo corporal y motriz (juego motor, expresión corporal, deportes, vida en la naturaleza) integrando los contenidos seleccionados.",
  },
  {
    id: "plastica",
    label: "Plástica / Artes visuales",
    prompt:
      "La docente es especialista en Artes Visuales: encará la propuesta desde el lenguaje visual (dibujo, pintura, collage, construcción, apreciación de obras) integrando los contenidos seleccionados.",
  },
  {
    id: "ingles",
    label: "Inglés",
    prompt:
      "La docente es especialista en Inglés: encará la propuesta desde la enseñanza del inglés como lengua extranjera integrando los contenidos seleccionados.",
  },
  {
    id: "tecnologia",
    label: "Tecnología / Informática",
    prompt:
      "La docente es especialista en Educación Tecnológica: encará la propuesta desde los procesos, medios técnicos y el pensamiento computacional integrando los contenidos seleccionados.",
  },
  {
    id: "teatro",
    label: "Teatro / Expresión",
    prompt:
      "La docente es especialista en Teatro: encará la propuesta desde el lenguaje teatral y la expresión dramática integrando los contenidos seleccionados.",
  },
  { id: "otra", label: "Otra especialidad", prompt: "" },
] as const;

export type TeacherSubjectId = (typeof TEACHER_SUBJECTS)[number]["id"];

/** Instrucción para la IA según la especialidad (vacía para maestra de grado). */
export function subjectPromptFor(id: string | null | undefined): string {
  return TEACHER_SUBJECTS.find((s) => s.id === id)?.prompt ?? "";
}

/**
 * Adaptaciones curriculares del grupo (por planificación). Describen la
 * configuración de apoyo, NUNCA identifican estudiantes.
 */
export const CURRICULAR_ADAPTATIONS = [
  { id: "dislexia", label: "Dislexia (lectura)" },
  { id: "discalculia", label: "Discalculia (matemática)" },
  { id: "disgrafia", label: "Disgrafía (escritura)" },
  { id: "tdah", label: "TDAH (atención/impulsividad)" },
  { id: "tea", label: "TEA (Espectro Autista)" },
  { id: "disc_intelectual", label: "Discapacidad intelectual" },
  { id: "disc_visual", label: "Discapacidad visual" },
  { id: "disc_auditiva", label: "Discapacidad auditiva" },
  { id: "disc_motriz", label: "Discapacidad motriz" },
  { id: "altas_capacidades", label: "Altas capacidades" },
  { id: "segunda_lengua", label: "Español como segunda lengua" },
] as const;

const ADAPTATION_LABEL = new Map<string, string>(
  CURRICULAR_ADAPTATIONS.map((a) => [a.id, a.label]),
);

/** Resumen legible de las adaptaciones elegidas (para guardar y para la IA). */
export function describeAdaptations(ids: string[], notes: string): string {
  const labels = [...new Set(ids)].map((id) => ADAPTATION_LABEL.get(id)).filter(Boolean);
  const parts: string[] = [];
  if (labels.length) parts.push(labels.join(", "));
  if (notes.trim()) parts.push(notes.trim());
  return parts.join(" · ");
}

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
    adaptations: z.array(z.string()).max(20).optional().default([]),
    adaptationNotes: z.string().trim().max(500).optional().default(""),
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
