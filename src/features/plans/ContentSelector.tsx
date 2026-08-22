"use client";

import { useMemo, useState } from "react";
import type { SelectedContent } from "./schema";
import { CURRICULUM_BY_GRADE } from "./curriculum";

type Row = {
  id: string;
  area: string;
  axis: string | null;
  content_number: string | null;
  content_text: string;
};

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
  const [openArea, setOpenArea] = useState<string | null>(null);
  const [openEjes, setOpenEjes] = useState<Set<string>>(new Set());

  // Generar filas desde curriculum.ts
  const rows = useMemo(() => {
    const gradeData = CURRICULUM_BY_GRADE[String(grade) as keyof typeof CURRICULUM_BY_GRADE];
    if (!gradeData) return [];

    const result: Row[] = [];
    Object.entries(gradeData).forEach(([areaId, areaData]) => {
      (areaData.contents as any).forEach((content: any) => {
        result.push({
          id: `${areaId}/${content.id}`,
          area: (areaData.label as any),
          axis: null,
          content_number: null,
          content_text: (content.label as any),
        });
      });
    });
    return result;
  }, [grade]);

  const loading = false;
  const error = null;

  const selectedIds = useMemo(() => new Set(selected.map((c) => c.id)), [selected]);
  const searching = query.trim().length > 0;

  // Sugeridos: un contenido de cada área para arrancar sin recorrer todo.
  const suggested = useMemo(() => {
    const seen = new Set<string>();
    const out: Row[] = [];
    for (const r of rows) {
      if (!seen.has(r.area)) {
        seen.add(r.area);
        out.push(r);
      }
    }
    return out.slice(0, 6);
  }, [rows]);

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

      {!searching && suggested.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
            Sugeridos para empezar
          </p>
          <div className="flex flex-col gap-2">
            {suggested.map((r) => {
              const checked = selectedIds.has(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleContent(r, !checked)}
                  aria-pressed={checked}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    checked
                      ? "border-accent bg-accent-2"
                      : "border-border bg-surface hover:border-accent"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      checked ? "bg-accent text-accent-ink" : "bg-surface-2 text-brand"
                    }`}
                  >
                    {checked ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold text-brand-ink">{r.area}</span>
                    <span className="block text-sm leading-snug text-ink">{r.content_text}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted">
            O explorá todos
          </p>
        </div>
      )}

      {searching && groups.size === 0 && (
        <p className="text-muted">No se encontraron contenidos para “{query}”.</p>
      )}

      {[...groups.entries()].map(([area, axes]) => {
        const areaSelected = selected.filter((c) => c.area === area).length;
        const areaOpen = openArea === area || searching;
        return (
          <div key={area} className="mb-3 overflow-hidden rounded-xl border border-border bg-surface">
            <button
              type="button"
              onClick={() => setOpenArea(areaOpen && !searching ? null : area)}
              aria-expanded={areaOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
            >
              <span className="font-heading text-lg font-bold text-brand">{area}</span>
              <span className="shrink-0 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-brand">
                {areaSelected > 0
                  ? `${areaSelected} seleccionado${areaSelected > 1 ? "s" : ""}`
                  : "Sin seleccionar"}
              </span>
            </button>

            {areaOpen && (
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
                                    {row.content_number && (
                                      <strong>{row.content_number}. </strong>
                                    )}
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
            )}
          </div>
        );
      })}
    </div>
  );
}
