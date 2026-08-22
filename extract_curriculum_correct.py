import os
import json
import re
from pathlib import Path

curriculum_path = Path(r"C:\Users\Pc\Desktop\primaria\diseno_curricular_santa_fe_FIEL_AL_PDF")
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

        # Buscar el archivo MD (generalmente es "objetivos-contenidos-y-ejes.md")
        md_files = list(area_dir.glob("*.md"))

        contents = []
        if md_files:
            # Leer el contenido del archivo
            md_content = md_files[0].read_text(encoding="utf-8")

            # Extraer títulos de secciones (líneas que empiezan con #)
            lines = md_content.split("\n")
            current_section = None

            for line in lines:
                # Buscar subtítulos y subsecciones
                if line.startswith("### "):
                    section_name = line.replace("### ", "").strip()
                    if section_name and "Grado" not in section_name:
                        contents.append({
                            "id": section_name.lower().replace(" ", "-"),
                            "label": section_name
                        })
                elif line.startswith("## ") and "Contenidos" in line:
                    current_section = "Contenidos"
                elif line.startswith("**") and current_section == "Contenidos":
                    # Líneas como "**Eje 1: ...**"
                    content_text = line.replace("**", "").strip()
                    if content_text and len(content_text) > 5:
                        contents.append({
                            "id": content_text.lower().replace(" ", "-")[:50],
                            "label": content_text
                        })

            # Si no encontró nada, agregar el nombre del archivo como contenido
            if not contents:
                contents.append({
                    "id": md_files[0].stem,
                    "label": md_files[0].stem.replace("-", " ").title()
                })

        areas[area_id] = {
            "label": area_label,
            "contents": contents if contents else [{
                "id": "contenidos-del-area",
                "label": "Contenidos del Área"
            }]
        }

    output[grade_num] = areas

# Generar el código TypeScript
ts_code = """/**
 * Currículum de Santa Fe - Áreas y contenidos por grado
 * Extraído de: C:\\Users\\Pc\\Desktop\\primaria\\diseno_curricular_santa_fe_FIEL_AL_PDF
 * Fiel al PDF oficial
 * Generado automáticamente
 */

export const CURRICULUM_BY_GRADE = """

ts_code += json.dumps(output, ensure_ascii=False, indent=2)

ts_code += """ as const;

export function getAreasForGrade(grade: number): string[] {
  return Object.keys(CURRICULUM_BY_GRADE[String(grade) as keyof typeof CURRICULUM_BY_GRADE] || {});
}

export function getContentsForGradeAndArea(
  grade: number,
  area: string
): { id: string; label: string }[] {
  const gradeData = CURRICULUM_BY_GRADE[String(grade) as keyof typeof CURRICULUM_BY_GRADE];
  return (gradeData?.[area as keyof typeof gradeData]?.contents as any) || [];
}

export function getAreaLabel(grade: number, area: string): string {
  const gradeData = CURRICULUM_BY_GRADE[String(grade) as keyof typeof CURRICULUM_BY_GRADE];
  return (gradeData?.[area as keyof typeof gradeData]?.label as any) || area;
}
"""

# Guardar el archivo
output_path = Path(r"C:\Users\Pc\Desktop\Yani\planificar\src\features\plans\curriculum.ts")
output_path.write_text(ts_code, encoding="utf-8")

print(f"Archivo actualizado: {output_path}")
print(f"Grados procesados: {list(output.keys())}")
for grade, areas in output.items():
    print(f"  {grade}to grado: {len(areas)} áreas")
