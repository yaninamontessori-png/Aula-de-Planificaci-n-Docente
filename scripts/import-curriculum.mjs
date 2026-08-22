#!/usr/bin/env node
/**
 * Importación reproducible del Diseño Curricular hacia Supabase.
 *
 * Uso (Node 22+ lee el .env con --env-file):
 *   node --env-file=.env.local scripts/import-curriculum.mjs ruta/al/archivo.csv
 *
 * Columnas esperadas del CSV (con encabezado, en este orden flexible por nombre):
 *   grade, area, axis, content_number, content_text[, source_year]
 *
 * - Usa SUPABASE_SERVICE_ROLE_KEY (omite RLS). Nunca lo ejecutes en el navegador.
 * - Es idempotente: calcula content_hash y hace upsert. Volver a correrlo no duplica.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const csvPath = process.argv[2];

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  console.error(
    "Ejecutá: node --env-file=.env.local scripts/import-curriculum.mjs <archivo.csv>",
  );
  process.exit(1);
}
if (!csvPath) {
  console.error(
    "Indicá la ruta del CSV. Ej.: node --env-file=.env.local scripts/import-curriculum.mjs data/curriculum.csv",
  );
  process.exit(1);
}

const JURISDICTION = "Santa Fe";
const LEVEL = "primaria";

/** Parser CSV mínimo con soporte de comillas dobles, comas y saltos internos. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const s = text.replace(/^﻿/, ""); // quita BOM
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function hashOf(parts) {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

const raw = readFileSync(csvPath, "utf8");
const rows = parseCsv(raw);
if (rows.length < 2) {
  console.error("El CSV no tiene filas de datos.");
  process.exit(1);
}

const header = rows[0].map((h) => h.trim().toLowerCase());
const col = (name) => header.indexOf(name);
const iGrade = col("grade");
const iArea = col("area");
const iAxis = col("axis");
const iNumber = col("content_number");
const iText = col("content_text");
const iYear = col("source_year");

if (iGrade < 0 || iArea < 0 || iText < 0) {
  console.error("El CSV debe incluir al menos las columnas: grade, area, content_text.");
  process.exit(1);
}

const records = [];
const seen = new Set();
for (let r = 1; r < rows.length; r++) {
  const cells = rows[r];
  const grade = parseInt((cells[iGrade] || "").trim(), 10);
  const area = (cells[iArea] || "").trim();
  const content_text = (cells[iText] || "").trim();
  if (!grade || !area || !content_text) continue;
  const axis = iAxis >= 0 ? (cells[iAxis] || "").trim() || null : null;
  const content_number = iNumber >= 0 ? (cells[iNumber] || "").trim() || null : null;
  const source_year =
    iYear >= 0 && cells[iYear] ? parseInt(cells[iYear], 10) || null : null;
  const content_hash = hashOf([
    JURISDICTION,
    LEVEL,
    grade,
    area,
    axis ?? "",
    content_number ?? "",
    content_text,
  ]);
  if (seen.has(content_hash)) continue; // evita duplicados dentro del mismo CSV
  seen.add(content_hash);
  records.push({
    jurisdiction: JURISDICTION,
    level: LEVEL,
    grade,
    area,
    axis,
    content_number,
    content_text,
    source_year,
    active: true,
    content_hash,
  });
}

console.log(`Filas válidas: ${records.length}. Subiendo a Supabase…`);
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

let ok = 0;
const size = 500;
for (let i = 0; i < records.length; i += size) {
  const chunk = records.slice(i, i + size);
  const { error } = await supabase
    .from("curriculum_contents")
    .upsert(chunk, { onConflict: "content_hash", ignoreDuplicates: false });
  if (error) {
    console.error(`Error en lote ${i / size + 1}: ${error.message}`);
    process.exit(1);
  }
  ok += chunk.length;
  console.log(`  ${ok}/${records.length}`);
}
console.log(`Listo. ${ok} contenidos importados/actualizados.`);
