/**
 * Cliente de Gemini — SOLO SERVIDOR.
 *
 * La clave vive en process.env.GEMINI_API_KEY (nunca NEXT_PUBLIC). Este módulo
 * se importa únicamente desde Server Actions. Pide una respuesta JSON
 * estructurada y la valida contra generatedSectionsSchema antes de devolverla.
 */
import {
  generatedSectionsSchema,
  describeAdaptations,
  type GeneratedSections,
  type PlanDraft,
} from "./schema";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
// Modelo de respaldo cuando el principal está sobrecargado (503) o sin cuota (429).
const FALLBACK_MODEL = "gemini-flash-lite-latest";

const SECTION_KEYS: (keyof GeneratedSections)[] = [
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
];

const responseSchema = {
  type: "object",
  properties: Object.fromEntries(SECTION_KEYS.map((k) => [k, { type: "string" }])),
  required: SECTION_KEYS,
};

/** Configuración pedagógica de la docente (viene de su Perfil). */
export type PlanGuidelines = {
  /** Instrucciones de los enfoques ("skills") activos. */
  skills: string[];
  /** Contexto del grupo/aula en texto libre. */
  notes: string;
  /** Enfoque según la especialidad de la docente (vacío para maestra de grado). */
  subject?: string;
};

function systemInstruction(guidelines?: PlanGuidelines): string {
  const lines = [
    "Sos una especialista en educación primaria y planificación curricular de Santa Fe, Argentina.",
    "Creá una propuesta situada, viable, inclusiva y coherente con la edad. No agregues contenidos curriculares que no estén en la selección docente.",
    "La pregunta motivadora debe funcionar como hilo conductor real, no como título decorativo.",
    "Las actividades deben detallar inicio, desarrollo, cierre, organización del grupo, intervenciones docentes y producciones esperadas.",
    "Usá evaluación formativa con criterios observables vinculados a los contenidos, sin confundir contenidos con indicadores de logro.",
    "Incluí adecuaciones y alternativas de acceso, participación y producción sin diagnosticar estudiantes ni nombrarlos.",
    "Escribí en español rioplatense profesional, claro y listo para que una docente lo edite.",
    "Dentro de cada campo largo usá subtítulos y viñetas con el carácter • cuando ayude a la lectura.",
  ];

  if (guidelines?.subject?.trim()) {
    lines.push("");
    lines.push(guidelines.subject.trim());
  }
  if (guidelines?.skills?.length) {
    lines.push("");
    lines.push("Aplicá de forma transversal y concreta estos enfoques elegidos por la docente:");
    for (const s of guidelines.skills) lines.push("• " + s);
  }
  if (guidelines?.notes?.trim()) {
    lines.push("");
    lines.push(
      "Tené en cuenta este contexto del grupo indicado por la docente (sin nombrar ni diagnosticar a estudiantes): " +
        guidelines.notes.trim(),
    );
  }
  return lines.join("\n");
}

function buildPrompt(d: PlanDraft): string {
  const areas = [...new Set(d.contents.map((c) => c.area))].sort();
  const grouped = d.contents.reduce<Record<string, string[]>>((acc, c) => {
    const key = `${c.area} · ${c.axis || "Sin eje"}`;
    (acc[key] ||= []).push(c.contentText);
    return acc;
  }, {});
  const lista = Object.entries(grouped)
    .map(([k, items]) => `${k}:\n${items.map((t) => "• " + t).join("\n")}`)
    .join("\n\n");

  const tipo = d.planningType === "secuencia_clases" ? "Secuencia de clases" : "Unidad didáctica mensual";
  const adaptaciones = describeAdaptations(d.adaptations, d.adaptationNotes);

  return [
    `TIPO: ${tipo}`,
    `ÁREAS ARTICULADAS: ${areas.join(", ")}`,
    `GRADO: ${d.grade}.º`,
    `DURACIÓN: ${d.duration || "a definir por la docente"}`,
    `TÍTULO INICIAL: ${d.title}`,
    `PREGUNTA MOTIVADORA: ${d.guidingQuestion}`,
    `RECURSO PROPUESTO POR LA DOCENTE: ${d.teacherResource || "ninguno"}`,
    "",
    "CONTENIDOS CURRICULARES AUTORIZADOS:",
    lista,
    adaptaciones
      ? `\nADAPTACIONES CURRICULARES A CONTEMPLAR: ${adaptaciones}.\nEn la sección "adecuaciones" desarrollá adaptaciones concretas y diferenciadas para estas configuraciones de apoyo: ajustes de acceso, de la actividad, de los materiales y de la evaluación, con estrategias específicas para cada una y basadas en el Diseño Universal para el Aprendizaje (DUA). No nombres ni identifiques a estudiantes.`
      : "",
    "",
    areas.length >= 2
      ? "La planificación debe articular de forma interdisciplinaria las áreas indicadas."
      : "La planificación se centra en el área indicada; profundizá en sus contenidos.",
    "Si la docente indicó un recurso, integralo de manera concreta en las actividades sin reemplazar los contenidos curriculares. Respetá la extensión elegida: una unidad mensual muestra progresión semanal; una secuencia organiza clases consecutivas.",
  ].join("\n");
}

export type GeminiResult = {
  sections: GeneratedSections;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
};

/** Llama a Gemini con un reintento ante errores transitorios (red / 5xx). */
export async function generateSections(
  draft: PlanDraft,
  guidelines?: PlanGuidelines,
): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("La generación con IA no está configurada (falta GEMINI_API_KEY).");

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemInstruction(guidelines) }] },
    contents: [{ role: "user", parts: [{ text: buildPrompt(draft) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.7,
    },
  });

  // Prueba el modelo principal y, si está sobrecargado, uno de respaldo.
  const models = GEMINI_MODEL === FALLBACK_MODEL ? [GEMINI_MODEL] : [GEMINI_MODEL, FALLBACK_MODEL];
  let lastError = "";

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    for (let attempt = 0; attempt < 2; attempt++) {
      let res: Response;
      try {
        res = await fetch(url, {
          method: "POST",
          headers: { "x-goog-api-key": apiKey, "content-type": "application/json" },
          body,
        });
      } catch {
        lastError = "No se pudo contactar el servicio de IA.";
        continue; // error de red: reintentar mismo modelo
      }

      if (res.status >= 500) {
        lastError = `El servicio de IA respondió ${res.status}.`;
        continue; // transitorio: reintentar y luego pasar al modelo de respaldo
      }

      // 429 = límite de uso de la API de Google (cuota gratuita agotada o
      // demasiadas solicitudes seguidas). Probamos el modelo de respaldo.
      if (res.status === 429) {
        lastError =
          "Se alcanzó el límite de generaciones gratuitas de la IA por ahora. " +
          "Esperá unos minutos e intentá de nuevo. Si pasa seguido, hay que " +
          "activar la facturación de la API de Gemini en Google.";
        break; // no reintentar el mismo modelo; pasar al de respaldo
      }

      const json = (await res.json()) as {
        error?: { message?: string };
        candidates?: { content?: { parts?: { text?: string }[] } }[];
        usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
      };

      if (!res.ok) {
        throw new Error(json.error?.message || `La IA respondió con estado ${res.status}.`);
      }

      const text = (json.candidates?.[0]?.content?.parts || [])
        .map((p) => p.text || "")
        .join("");
      if (!text) throw new Error("La IA respondió sin contenido utilizable.");

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("La IA devolvió un formato inesperado.");
      }

      const result = generatedSectionsSchema.safeParse(parsed);
      if (!result.success) throw new Error("La planificación generada está incompleta. Probá de nuevo.");

      return {
        sections: result.data,
        model,
        inputTokens: json.usageMetadata?.promptTokenCount ?? null,
        outputTokens: json.usageMetadata?.candidatesTokenCount ?? null,
      };
    }
  }

  throw new Error(lastError || "La IA no está disponible en este momento.");
}
