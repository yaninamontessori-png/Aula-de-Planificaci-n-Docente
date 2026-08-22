import re
from pathlib import Path
import json

curriculum_path = Path(r"C:\Users\Pc\Desktop\primaria\diseno_curricular_santa_fe_FIEL_AL_PDF")
output = {}

def extract_ejes_from_markdown(content: str, grade_num: int) -> list:
    """Extrae los ejes principales del contenido Markdown"""
    ejes = []

    # Encontrar todos los bloques de código (```text...```)
    blocks = re.findall(r'```text\n(.*?)\n```', content, re.DOTALL)

    for block in blocks:
        lines = block.split('\n')

        # Buscar líneas que son EJES (todas en mayúsculas, no son encabezados)
        for line in lines:
            stripped = line.strip()

            # Un eje tiene estas características:
            # - Está en MAYÚSCULAS
            # - Tiene más de 5 caracteres
            # - NO contiene números de grado o palabras como "Página", "Grado"
            if (stripped and
                stripped.isupper() and
                len(stripped) > 8 and
                "PÁGINA" not in stripped and
                "CICLO" not in stripped and
                "GRADO" not in stripped and
                "Primer Grado" not in stripped and
                "Segundo Grado" not in stripped and
                "Tercer Grado" not in stripped):

                # Evitar duplicados
                if stripped not in [e["label"] for e in ejes]:
                    ejes.append({
                        "id": stripped.lower().replace(" ", "-"),
                        "label": stripped
                    })

    return ejes

# Recorrer grados
for grade_dir in sorted(curriculum_path.iterdir()):
    if not grade_dir.is_dir() or not grade_dir.name.startswith(("0", "1")):
        continue

    grade_num = int(grade_dir.name.split("-")[0])
    print(f"Procesando {grade_num}º grado...")

    areas = {}

    # Recorrer áreas
    for area_dir in sorted(grade_dir.iterdir()):
        if not area_dir.is_dir():
            continue

        area_id = area_dir.name
        area_label = area_dir.name.replace("-", " ").title()

        # Buscar archivo MD
        md_files = list(area_dir.glob("*.md"))

        if md_files:
            md_content = md_files[0].read_text(encoding="utf-8", errors="ignore")
            ejes = extract_ejes_from_markdown(md_content, grade_num)

            areas[area_id] = {
                "label": area_label,
                "contents": ejes if ejes else [{
                    "id": "contenidos-del-area",
                    "label": "Contenidos"
                }]
            }
        else:
            areas[area_id] = {
                "label": area_label,
                "contents": [{
                    "id": "contenidos-del-area",
                    "label": "Contenidos"
                }]
            }

    output[grade_num] = areas

# Generar TypeScript
ts_code = '''/**
 * Currículum de Santa Fe - Áreas, ejes y contenidos por grado
 * Extraído de: C:\\Users\\Pc\\Desktop\\primaria\\diseno_curricular_santa_fe_FIEL_AL_PDF
 * Fiel al PDF oficial
 */

export const CURRICULUM_BY_GRADE = '''

ts_code += json.dumps(output, ensure_ascii=False, indent=2)

ts_code += ''' as const;

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
'''

output_path = Path(r"C:\Users\Pc\Desktop\Yani\planificar\src\features\plans\curriculum.ts")
output_path.write_text(ts_code, encoding="utf-8")

print(f"\nArchivo actualizado correctamente")
print(f"Total grados: {len(output)}")
for grade, areas in output.items():
    total_contenidos = sum(len(a.get("contents", [])) for a in areas.values())
    print(f"  {grade}º: {len(areas)} áreas, {total_contenidos} contenidos totales")
