import pkg from "xlsx";
const XLSX = pkg;
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "informacion");
const outFile = join(process.cwd(), "src", "features", "plans", "curriculum-data.json");

// Mapea nombre de archivo → id de área y etiqueta
const AREA_MAP = [
  { match: /Artes_Audiovisuales/i, id: "artes-audiovisuales", label: "Artes Audiovisuales" },
  { match: /Artes_Visuales/i, id: "artes-visuales", label: "Artes Visuales" },
  { match: /Ciencias_Naturales/i, id: "ciencias-naturales", label: "Ciencias Naturales" },
  { match: /Ciencias_Sociales/i, id: "ciencias-sociales", label: "Ciencias Sociales" },
  { match: /Danza/i, id: "danza", label: "Danza" },
  { match: /Educacion_Fisica/i, id: "educacion-fisica", label: "Educación Física" },
  { match: /Educacion_Tecnologica/i, id: "educacion-tecnologica", label: "Educación Tecnológica" },
  { match: /Lengua_y_Literatura/i, id: "lengua-y-literatura", label: "Lengua y Literatura" },
  { match: /Lenguas_Extranjeras/i, id: "lenguas-extranjeras", label: "Lenguas Extranjeras" },
  { match: /Matematica/i, id: "matematica", label: "Matemática" },
  { match: /Musica/i, id: "musica", label: "Música" },
  { match: /Saberes_Vidas_y_Mundos/i, id: "saberes-vidas-y-mundos", label: "Saberes, Vidas y Mundos" },
  { match: /Teatro/i, id: "teatro", label: "Teatro" },
];

function areaFor(fileName) {
  return AREA_MAP.find((a) => a.match.test(fileName));
}

// Estructura final: { [grade]: { [areaId]: { label, ejes: { [ejeName]: string[] } } } }
const data = {};
for (let g = 1; g <= 7; g++) data[g] = {};

const files = readdirSync(dir).filter((f) => f.endsWith(".xlsx"));

for (const file of files) {
  const area = areaFor(file);
  if (!area) {
    console.warn(`⚠ Sin mapeo de área para: ${file}`);
    continue;
  }

  const wb = XLSX.readFile(join(dir, file));

  for (let grade = 1; grade <= 7; grade++) {
    const sheetName = wb.SheetNames.find((n) => new RegExp(`^${grade}\\D`).test(n.trim()));
    if (!sheetName) continue;

    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });

    // Encontrar la fila de encabezado (donde B === "Eje")
    let headerIdx = rows.findIndex(
      (r) => (r[1] || "").toString().trim().toLowerCase() === "eje",
    );
    if (headerIdx === -1) headerIdx = 2;

    const ejes = {};
    let currentEje = "";

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const r = rows[i] || [];
      const ejeCell = (r[1] || "").toString().trim();
      const contentCell = (r[2] || "").toString().trim();

      if (ejeCell) currentEje = ejeCell;
      if (!contentCell) continue;

      const eje = currentEje || "General";
      if (!ejes[eje]) ejes[eje] = [];
      ejes[eje].push(contentCell);
    }

    if (Object.keys(ejes).length > 0) {
      data[grade][area.id] = { label: area.label, ejes };
    }
  }

  console.log(`✓ ${area.label}`);
}

writeFileSync(outFile, JSON.stringify(data, null, 2), "utf8");

// Resumen
let totalContents = 0;
for (let g = 1; g <= 7; g++) {
  for (const areaId of Object.keys(data[g])) {
    for (const eje of Object.keys(data[g][areaId].ejes)) {
      totalContents += data[g][areaId].ejes[eje].length;
    }
  }
}
console.log(`\n✓ Generado: ${outFile}`);
console.log(`  Total contenidos: ${totalContents}`);
