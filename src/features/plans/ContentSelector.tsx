"use client";

import { useMemo, useState } from "react";
import type { SelectedContent } from "./schema";
import { getAllContentsForGrade } from "./curriculum";

type Row = {
  id: string;
  area: string;
  axis: string | null;
  content_number: string | null;
  content_text: string;
};

// Orden de las áreas en el selector. "__ARTISTICA__" es un grupo que contiene
// las cinco áreas artísticas anidadas.
const ARTISTICA_LABEL = "Educación Artística";
const ARTISTICA_AREAS = [
  "Artes Visuales",
  "Música",
  "Danza",
  "Teatro",
  "Artes Audiovisuales",
];
const TOP_ORDER = [
  "Lengua y Literatura",
  "Matemática",
  "Ciencias Naturales",
  "Ciencias Sociales",
  "Saberes, Vidas y Mundos",
  "__ARTISTICA__",
  "Educación Física",
  "Educación Tecnológica",
  "Lenguas Extranjeras",
];

export function ContentSelector({
  grade,
  selected,
  onChange,
}: {
  grade: number;
  selected: SelectedContent[];
  onChange: (next: SelectedContent[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [openAreas, setOpenAreas] = useState<Set<string>>(new Set());
  const [openEjes, setOpenEjes] = useState<Set<string>>(new Set());

  // Generar filas desde curriculum.ts (datos de los Excel de /informacion)
  const { rows, loading, error } = useMemo(() => {
    try {
      const contents = getAllContentsForGrade(grade);
      const result: Row[] = contents.map((c) => ({
        id: c.id,
        area: c.areaLabel,
        axis: c.eje,
        content_number: null,
        content_text: c.label,
      }));
      return { rows: result, loading: false, error: null };
    } catch (err) {
      return {
        rows: [],
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los contenidos",
      };
    }
  }, [grade]);

  const selectedIds = useMemo(() => new Set(selected.map((c) => c.id)), [selected]);
  const searching = query.trim().length > 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.area} ${r.axis ?? ""} ${r.content_number ?? ""} ${r.content_text}`
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  // Agrupa área → eje conservando el orden.
  const groups = useMemo(() => {
    const byArea = new Map<string, Map<string, Row[]>>();
    for (const r of filtered) {
      const axis = r.axis || "Sin eje";
      if (!byArea.has(r.area)) byArea.set(r.area, new Map());
      const axes = byArea.get(r.area)!;
      if (!axes.has(axis)) axes.set(axis, []);
      axes.get(axis)!.push(r);
    }
    return byArea;
  }, [filtered]);

  // Ordena las áreas según TOP_ORDER; agrupa las artísticas bajo un nodo especial.
  const topLevel = useMemo(() => {
    type Item =
      | { kind: "area"; area: string; axes: Map<string, Row[]> }
      | { kind: "artistica"; subAreas: { area: string; axes: Map<string, Row[]> }[] };

    const items: Item[] = [];
    const placed = new Set<string>();

    for (const entry of TOP_ORDER) {
      if (entry === "__ARTISTICA__") {
        const subAreas = ARTISTICA_AREAS.filter((a) => groups.has(a)).map((area) => {
          placed.add(area);
          return { area, axes: groups.get(area)! };
        });
        if (subAreas.length > 0) items.push({ kind: "artistica", subAreas });
      } else if (groups.has(entry)) {
        placed.add(entry);
        items.push({ kind: "area", area: entry, axes: groups.get(entry)! });
      }
    }

    // Áreas que no estén en TOP_ORDER (por si se agregan nuevas): al final.
    for (const [area, axes] of groups.entries()) {
      if (!placed.has(area)) items.push({ kind: "area", area, axes });
    }

    return items;
  }, [groups]);

  function toggleContent(row: Row, checked: boolean) {
    if (checked) {
      onChange([
        ...selected,
        {
          id: row.id,
          area: row.area,
          axis: row.axis,
          contentNumber: row.content_number,
          contentText: row.content_text,
        },
      ]);
    } else {
      onChange(selected.filter((c) => c.id !== row.id));
    }
  }

  function toggleEje(key: string) {
    setOpenEjes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleArea(key: string) {
    setOpenAreas((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Renderiza el acordeón de ejes de un área (reutilizado en áreas normales y
  // en las subáreas artísticas).
  function renderAxes(area: string, axes: Map<string, Row[]>) {
    return (
      <div className="border-t border-border p-2">
        {[...axes.entries()].map(([axis, items]) => {
          const key = `${area}||${axis}`;
          const ejeOpen = openEjes.has(key) || searching;
          const ejeSelected = items.filter((r) => selectedIds.has(r.id)).length;
          return (
            <div key={key} className="mb-1 overflow-hidden rounded-lg border border-border">
              <button
                type="button"
                onClick={() => toggleEje(key)}
                aria-expanded={ejeOpen}
                className="flex w-full items-center justify-between gap-3 bg-surface-2 px-3 py-3 text-left"
              >
                <span className="text-sm font-semibold text-brand-ink">
                  {axis}
                  {ejeSelected > 0 && (
                    <span className="ml-2 text-brand-2">· {ejeSelected} sel.</span>
                  )}
                </span>
                <span className="shrink-0 text-sm font-semibold text-muted">
                  {items.length}
                </span>
              </button>

              {ejeOpen && (
                <ul className="bg-surface px-2 py-1">
                  {items.map((row) => {
                    const checked = selectedIds.has(row.id);
                    return (
                      <li key={row.id}>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-surface-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggleContent(row, e.target.checked)}
                            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-brand)]"
                          />
                          <span className="text-sm leading-snug">
                            {row.content_number && <strong>{row.content_number}. </strong>}
                            {row.content_text}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Renderiza la tarjeta de un área (con contador de selección).
  function renderAreaCard(area: string, axes: Map<string, Row[]>, nested = false) {
    const areaSelected = selected.filter((c) => c.area === area).length;
    const areaOpen = openAreas.has(area) || searching;
    return (
      <div
        key={area}
        className={`overflow-hidden rounded-xl border border-border bg-surface ${nested ? "mb-2" : "mb-3"}`}
      >
        <button
          type="button"
          onClick={() => toggleArea(area)}
          aria-expanded={areaOpen}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
        >
          <span className={`font-heading font-bold text-brand ${nested ? "text-base" : "text-lg"}`}>
            {area}
          </span>
          <span className="shrink-0 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-brand">
            {areaSelected > 0
              ? `${areaSelected} seleccionado${areaSelected > 1 ? "s" : ""}`
              : "Sin seleccionar"}
          </span>
        </button>
        {areaOpen && renderAxes(area, axes)}
      </div>
    );
  }

  if (loading) return <p className="text-muted">Cargando contenidos…</p>;
  if (error)
    return (
      <p role="alert" className="rounded-lg bg-danger-bg p-4 text-danger">
        {error}
      </p>
    );
  if (rows.length === 0)
    return (
      <p className="rounded-lg border border-dashed border-border bg-surface p-6 text-muted">
        No hay contenidos cargados para {grade}.º grado todavía.
      </p>
    );

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar un contenido…"
        aria-label="Buscar un contenido"
        className="mb-4 w-full rounded-xl border border-border bg-surface px-3 py-3"
      />


      {searching && groups.size === 0 && (
        <p className="text-muted">No se encontraron contenidos para “{query}”.</p>
      )}

      {topLevel.map((item) => {
        if (item.kind === "area") {
          return renderAreaCard(item.area, item.axes);
        }

        // Grupo "Educación Artística": contiene las subáreas artísticas.
        const groupSelected = item.subAreas.reduce(
          (acc, s) => acc + selected.filter((c) => c.area === s.area).length,
          0,
        );
        const groupOpen = openAreas.has(ARTISTICA_LABEL) || searching;
        return (
          <div
            key={ARTISTICA_LABEL}
            className="mb-3 overflow-hidden rounded-xl border border-border bg-surface"
          >
            <button
              type="button"
              onClick={() => toggleArea(ARTISTICA_LABEL)}
              aria-expanded={groupOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
            >
              <span className="font-heading text-lg font-bold text-brand">
                {ARTISTICA_LABEL}
              </span>
              <span className="shrink-0 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-brand">
                {groupSelected > 0
                  ? `${groupSelected} seleccionado${groupSelected > 1 ? "s" : ""}`
                  : "Sin seleccionar"}
              </span>
            </button>

            {groupOpen && (
              <div className="border-t border-border bg-surface-2/40 p-2">
                {item.subAreas.map((s) => renderAreaCard(s.area, s.axes, true))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
