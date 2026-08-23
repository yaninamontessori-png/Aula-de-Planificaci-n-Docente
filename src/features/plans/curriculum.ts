/**
 * Currículum de Santa Fe — generado desde los Excel de /informacion
 * Fuente de datos: curriculum-data.json (ver scripts/generate-curriculum.mjs)
 * Estructura: { [grade]: { [areaId]: { label, ejes: { [ejeName]: string[] } } } }
 */
import curriculumData from "./curriculum-data.json";

type Eje = Record<string, string[]>;
type Area = { label: string; ejes: Eje };
type GradeMap = Record<string, Area>;

const DATA = curriculumData as unknown as Record<string, GradeMap>;

export type CurriculumContent = { id: string; label: string; eje: string };

export function getAreasForGrade(grade: number): { id: string; label: string }[] {
  const g = DATA[String(grade)];
  if (!g) return [];
  return Object.entries(g).map(([id, area]) => ({ id, label: area.label }));
}

export function getAreaLabel(grade: number, areaId: string): string {
  return DATA[String(grade)]?.[areaId]?.label ?? areaId;
}

/** Devuelve todos los contenidos de un grado+área, con su eje e id único. */
export function getContentsForGradeAndArea(
  grade: number,
  areaId: string,
): CurriculumContent[] {
  const area = DATA[String(grade)]?.[areaId];
  if (!area) return [];

  const out: CurriculumContent[] = [];
  let n = 1;
  for (const [eje, contents] of Object.entries(area.ejes)) {
    for (const label of contents) {
      out.push({ id: `${areaId}/${grade}/${n}`, label, eje });
      n++;
    }
  }
  return out;
}

/** Todos los contenidos de un grado (todas las áreas). */
export function getAllContentsForGrade(grade: number): {
  areaId: string;
  areaLabel: string;
  eje: string;
  id: string;
  label: string;
}[] {
  const g = DATA[String(grade)];
  if (!g) return [];

  const out = [];
  for (const [areaId, area] of Object.entries(g)) {
    let n = 1;
    for (const [eje, contents] of Object.entries(area.ejes)) {
      for (const label of contents) {
        out.push({
          areaId,
          areaLabel: area.label,
          eje,
          id: `${areaId}/${grade}/${n}`,
          label,
        });
        n++;
      }
    }
  }
  return out;
}
