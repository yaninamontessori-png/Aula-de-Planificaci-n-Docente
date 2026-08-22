import os
import re
from pathlib import Path

curriculum_path = Path(r"C:\Users\Pc\Desktop\primaria\diseno_curricular_santa_fe_FIEL_AL_PDF")
output = {}

def extract_grade_content(md_text: str, target_grade: int) -> list:
    """Extrae contenidos específicos para un grado del texto MD"""
    contents = []

    # Buscar tablas de contenidos
    lines = md_text.split('\n')

    # Buscar títulos de ejes (líneas en MAYÚSCULAS o con estructura específica)
    current_eje = None
    in_table = False

    for i, line in enumerate(lines):
        # Detectar bloques de código (tablas)
        if line.strip().startswith("```text"):
            in_table = True
            # Obtener el siguiente bloque completo
            table_block = []
            j = i + 1
            while j < len(lines) and not lines[j].strip().startswith("```"):
                table_block.append(lines[j])
                j += 1

            # Procesar el bloque de tabla
            block_text = '\n'.join(table_block)

            # Buscar líneas que parecen ser ejes (todas mayúsculas o formatos específicos)
            for block_line in table_block:
                if block_line.strip() and block_line.strip().isupper() and len(block_line.strip()) > 5:
                    current_eje = block_line.strip()
                    if current_eje not in [c["eje"] for c in contents]:
                        contents.append({"eje": current_eje, "items": []})

                # Si estamos en un eje, buscar contenidos para primer grado
                # Primer grado está en la primera columna
                if current_eje and block_line.strip() and not block_line.strip().isupper():
                    # Los contenidos de primer grado son generalmente el primer párrafo/línea
                    if block_line.strip() and len(block_line.strip()) > 10:
                        # Agregar como contenido
                        if contents:
                            contents[-1]["items"].append(block_line.strip())

    return contents

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

        # Buscar el archivo MD
        md_files = list(area_dir.glob("*.md"))

        contents_list = []
        if md_files:
            md_content = md_files[0].read_text(encoding="utf-8")

            # Extraer bloques con contenido (entre ``` ```)
            blocks = re.findall(r'```text\n(.*?)\n```', md_content, re.DOTALL)

            for block in blocks:
                lines = block.split('\n')

                # Buscar títulos de EJES (líneas en mayúsculas)
                for i, line in enumerate(lines):
                    stripped = line.strip()

                    # Detectar ejes (líneas que son principalmente mayúsculas)
                    if stripped and stripped.isupper() and len(stripped) > 8:
                        # Verificar que no sea parte de una tabla
                        if not any(word in stripped for word in ["Grado", "Ciclo", "Página"]):
                            # Este es un eje
                            eje_name = stripped

                            # Buscar contenidos específicos después de este eje
                            # Los contenidos de primer grado están antes de "Segundo Grado"
                            j = i + 1
                            content_items = []

                            while j < len(lines):
                                next_line = lines[j].strip()

                                # Parar si encontramos "Segundo Grado" o otro eje
                                if "Segundo Grado" in next_line or (next_line.isupper() and len(next_line) > 8 and next_line != eje_name):
                                    break

                                # Capturar líneas que parecen contenido
                                if next_line and len(next_line) > 15 and not next_line.startswith("•"):
                                    # Remover espacios múltiples
                                    cleaned = " ".join(next_line.split())
                                    if cleaned and len(cleaned) > 10:
                                        content_items.append(cleaned)

                                j += 1

                            # Si encontramos contenidos, agregarlos
                            if content_items:
                                contents_list.append({
                                    "id": eje_name.lower().replace(" ", "-")[:50],
                                    "label": eje_name
                                })

        # Si no encontró contenidos estructurados, generar un placeholder
        if not contents_list:
            # Sacar del primer archivo encontrado
            if md_files:
                contents_list.append({
                    "id": md_files[0].stem,
                    "label": area_label + " - Contenidos del Área"
                })

        areas[area_id] = {
            "label": area_label,
            "contents": contents_list[:15] if contents_list else [{
                "id": "contenidos",
                "label": "Contenidos"
            }]
        }

    output[grade_num] = areas
    print(f"Grado {grade_num}: {len(areas)} áreas procesadas")

# Generar TypeScript
ts_code = """/**
 * Currículum de Santa Fe - Áreas, ejes y contenidos por grado
 * Extraído de: C:\\Users\\Pc\\Desktop\\primaria\\diseno_curricular_santa_fe_FIEL_AL_PDF
 * Fiel al PDF oficial - Éxodo 2025
 */

export const CURRICULUM_BY_GRADE = """

import json
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

output_path = Path(r"C:\Users\Pc\Desktop\Yani\planificar\src\features\plans\curriculum.ts")
output_path.write_text(ts_code, encoding="utf-8")

print(f"\n✅ Archivo generado: {output_path.name}")
print(f"Total de grados: {len(output)}")
