/**
 * Generación del PDF de una planificación con pdfmake (lado cliente).
 * Diseño "Papelería pastel": terracota + salvia, secciones separadas.
 */
import { SECTION_LABELS, type GeneratedSections } from "./schema";

// Colores de marca (ver globals.css)
const BRAND = "#a45c3c";
const BRAND_INK = "#4a3f2a";
const INK = "#2f2a24";
const SOFT = "#f0e6d4";
const SALVIA = "#cfe4d6";
const SALVIA_INK = "#26302a";
const MUTED = "#7a7268";

const tipoLabel: Record<string, string> = {
  unidad_mensual: "Unidad didáctica mensual",
  secuencia_clases: "Secuencia de clases",
};

export type PlanForPdf = {
  title: string;
  planning_type: string;
  grade: number;
  institution: string | null;
  duration: string | null;
  guiding_question: string;
  teacher_name?: string | null;
};

// Orden de secciones en el PDF (el título va en el encabezado, no como sección).
const SECTION_ORDER = (Object.keys(SECTION_LABELS) as (keyof GeneratedSections)[]).filter(
  (k) => k !== "titulo",
);

function metaChip(label: string, value: string) {
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: [
              { text: label.toUpperCase(), fontSize: 7, color: MUTED, characterSpacing: 0.5 },
              { text: value, fontSize: 9.5, color: BRAND_INK, bold: true, margin: [0, 1, 0, 0] },
            ],
          },
        ],
      ],
    },
    layout: {
      fillColor: () => SOFT,
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 6,
      paddingBottom: () => 6,
    },
  };
}

export async function buildPlanPdfDefinition(
  plan: PlanForPdf,
  sections: Partial<GeneratedSections>,
) {
  const activeSections = SECTION_ORDER.filter((k) => sections[k]?.trim());

  // Chips de metadatos (2 columnas).
  const chips = [
    metaChip("Tipo", tipoLabel[plan.planning_type] ?? plan.planning_type),
    metaChip("Grado", `${plan.grade}.º grado`),
    metaChip("Institución", plan.institution || "—"),
    metaChip("Duración", plan.duration || "—"),
  ];

  const content: any[] = [
    // Encabezado con banda terracota
    {
      table: {
        widths: ["*"],
        body: [
          [
            {
              stack: [
                {
                  text: "PLANIFICACIÓN DIDÁCTICA",
                  color: "#f7e9df",
                  fontSize: 8,
                  characterSpacing: 1.5,
                  bold: true,
                },
                {
                  text: plan.title,
                  color: "#ffffff",
                  fontSize: 18,
                  bold: true,
                  margin: [0, 4, 0, 0],
                  lineHeight: 1.05,
                },
              ],
            },
          ],
        ],
      },
      layout: {
        fillColor: () => BRAND,
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 16,
        paddingRight: () => 16,
        paddingTop: () => 14,
        paddingBottom: () => 14,
      },
      margin: [0, 0, 0, 12],
    },

    // Metadatos en grilla 2x2
    {
      columns: [chips[0], chips[1]],
      columnGap: 8,
      margin: [0, 0, 0, 8],
    },
    {
      columns: [chips[2], chips[3]],
      columnGap: 8,
      margin: [0, 0, 0, 14],
    },

    // Pregunta orientadora destacada (caja salvia)
    {
      table: {
        widths: ["*"],
        body: [
          [
            {
              stack: [
                {
                  text: "PREGUNTA ORIENTADORA",
                  fontSize: 8,
                  color: SALVIA_INK,
                  bold: true,
                  characterSpacing: 1,
                },
                {
                  text: plan.guiding_question,
                  fontSize: 11,
                  italics: true,
                  color: SALVIA_INK,
                  margin: [0, 4, 0, 0],
                  lineHeight: 1.2,
                },
              ],
            },
          ],
        ],
      },
      layout: {
        fillColor: () => SALVIA,
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 14,
        paddingRight: () => 14,
        paddingTop: () => 10,
        paddingBottom: () => 10,
      },
      margin: [0, 0, 0, 16],
    },
  ];

  // Secciones generadas: título terracota + regla + cuerpo.
  activeSections.forEach((key) => {
    content.push({
      text: SECTION_LABELS[key],
      color: BRAND,
      fontSize: 12.5,
      bold: true,
      margin: [0, 0, 0, 3],
    });
    content.push({
      canvas: [
        { type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: SOFT },
      ],
      margin: [0, 0, 0, 5],
    });
    content.push({
      text: sections[key],
      fontSize: 10,
      color: INK,
      lineHeight: 1.3,
      margin: [0, 0, 0, 13],
    });
  });

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 48] as [number, number, number, number],
    info: { title: plan.title, subject: "Planificación didáctica" },
    defaultStyle: { font: "Roboto", color: INK },
    content,
    footer: (currentPage: number, pageCount: number) => ({
      margin: [40, 12, 40, 0] as [number, number, number, number],
      columns: [
        {
          text: "Generado con Aula de Planificación",
          fontSize: 8,
          color: MUTED,
        },
        {
          text: `${currentPage} / ${pageCount}`,
          alignment: "right",
          fontSize: 8,
          color: MUTED,
        },
      ],
    }),
  };

  return docDefinition;
}

/** Carga pdfmake dinámicamente (solo en cliente) y devuelve el PDF como Blob. */
export async function generatePlanPdfBlob(
  plan: PlanForPdf,
  sections: Partial<GeneratedSections>,
): Promise<Blob> {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");

  const pdfMake: any = (pdfMakeModule as any).default ?? pdfMakeModule;

  // En pdfmake 0.3.x, vfs_fonts exporta el objeto de fuentes directamente
  // (a veces envuelto en { default } o { vfs } según el bundler).
  const fontsExport: any = (pdfFontsModule as any).default ?? pdfFontsModule;
  const vfs: any = fontsExport?.vfs ?? fontsExport;
  if (vfs && !pdfMake.vfs) pdfMake.vfs = vfs;

  const docDefinition = await buildPlanPdfDefinition(plan, sections);

  return new Promise<Blob>((resolve) => {
    pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => resolve(blob));
  });
}

export function planPdfFilename(plan: PlanForPdf): string {
  const safe = plan.title.replace(/[^\p{L}\p{N} _-]/gu, "").trim() || "planificacion";
  return `${safe}.pdf`;
}
