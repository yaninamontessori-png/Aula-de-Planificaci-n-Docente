import os
import json
from pathlib import Path

curriculum_path = Path(r"C:\Users\Pc\Desktop\primaria\output\diseno_curricular_santa_fe_md")
output = {}

# Recorrer cada grado
for grade_dir in sorted(curriculum_path.iterdir()):
    if not grade_dir.is_dir() or not grade_dir.name.startswith(("0", "1")):
        continue

    grade_num = int(grade_dir.name.split("-")[0])

    # Recorrer cada área
    areas = {}
    for area_dir in sorted(grade_dir.iterdir()):
        if not area_dir.is_dir():
            continue

        area_id = area_dir.name
        area_label = area_dir.name.replace("-", " ").title()

        # Recorrer cada contenido (archivo .md)
        contents = []
        for md_file in sorted(area_dir.glob("*.md")):
            content_id = md_file.stem
            content_label = md_file.stem.replace("-", " ").title()
            contents.append({
                "id": content_id,
                "label": content_label
            })

        areas[area_id] = {
            "label": area_label,
            "contents": contents
        }

    output[grade_num] = areas

# Generar el código TypeScript
ts_code = """/**
 * Currículum de Santa Fe - Áreas y contenidos por grado
 * Extraído de: C:\\Users\\Pc\\Desktop\\primaria\\output\\diseno_curricular_santa_fe_md
 * Generado automáticamente
 */

export const CURRICULUM_BY_GRADE = """

ts_code += json.dumps(output, ensure_ascii=False, indent=2)

ts_code += """ as const;

export function getAreasForGrade(grade: number): string[] {
  return Object.keys(CURRICULUM_BY_GRADE[grade] || {});
}

export function getContentsForGradeAndArea(
  grade: number,
  area: string
): { id: string; label: string }[] {
  return CURRICULUM_BY_GRADE[grade]?.[area]?.contents || [];
}

export function getAreaLabel(grade: number, area: string): string {
  return CURRICULUM_BY_GRADE[grade]?.[area]?.label || area;
}
"""

# Guardar el archivo
output_path = Path(r"C:\Users\Pc\Desktop\Yani\planificar\src\features\plans\curriculum.ts")
output_path.write_text(ts_code, encoding="utf-8")

print(f"✅ Archivo generado: {output_path}")
print(f"📊 Grados procesados: {list(output.keys())}")
for grade, areas in output.items():
    print(f"   {grade}to grado: {len(areas)} áreas")
