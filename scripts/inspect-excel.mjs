import pkg from "xlsx";
const XLSX = pkg;
import { readdirSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "informacion");
const files = readdirSync(dir).filter((f) => f.endsWith(".xlsx"));

for (const file of files) {
  const wb = XLSX.readFile(join(dir, file));
  console.log(`\n=== ${file} ===`);
  console.log("Hojas:", wb.SheetNames.join(" | "));

  // Inspeccionar la primera hoja de grado (buscar "1" o "1°")
  const gradeSheet = wb.SheetNames.find((n) => /1/.test(n) && !/LEER|FUENTE/i.test(n));
  if (gradeSheet) {
    const ws = wb.Sheets[gradeSheet];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
    console.log(`Hoja "${gradeSheet}" primeras 6 filas (cols A,B,C):`);
    for (let i = 0; i < Math.min(6, rows.length); i++) {
      const r = rows[i] || [];
      console.log(`  [${i}] A="${r[0] ?? ""}" B="${r[1] ?? ""}" C="${(r[2] ?? "").toString().slice(0, 60)}"`);
    }
  }
}
