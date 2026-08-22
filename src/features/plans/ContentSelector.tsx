"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SelectedContent } from "./schema";

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
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [openArea, setOpenArea] = useState<string | null>(null);

  useEffect(() => {
    // El componente se remonta con key={grade} desde el Wizard, así que el
    // estado inicial (loading=true) ya es el correcto: acá solo actualizamos
    // el estado dentro del callback asíncrono.
    let active = true;
    const supabase = createClient();
    supabase
      .from("curriculum_contents")
      .select("id, area, axis, content_number, content_text")
      .eq("grade", grade)
      .eq("active", true)
      .order("area")
      .order("axis")
      .order("content_number")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError("No se pudieron cargar los contenidos.");
        else setRows((data as Row[]) ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [grade]);

  const selectedIds = useMemo(() => new Set(selected.map((c) => c.id)), [selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.area} ${r.axis ?? ""} ${r.content_text}`.toLowerCase().includes(q),
    );
  }, [rows, query]);

  // Agrupa área → eje.
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

  function toggle(row: Row, checked: boolean) {
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
        No hay contenidos cargados para {grade}.º grado todavía. Importá el
        Diseño Curricular con el script <code>import:curriculum</code>.
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
        className="mb-4 w-full rounded-lg border border-border bg-surface px-3 py-3"
      />

      {[...groups.entries()].map(([area, axes]) => {
        const areaCount = selected.filter((c) => c.area === area).length;
        const isOpen = openArea === area || query.trim().length > 0;
        return (
          <div key={area} className="mb-3 overflow-hidden rounded-xl border border-border bg-surface">
            <button
              type="button"
              onClick={() => setOpenArea(isOpen && !query ? null : area)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-heading font-bold text-brand"
            >
              <span>{area}</span>
              <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-brand">
                {areaCount > 0 ? `${areaCount} sel.` : "—"}
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-border px-3 pb-3">
                {[...axes.entries()].map(([axis, items]) => (
                  <div key={axis} className="mt-3">
                    <p className="mb-1 px-1 text-sm font-semibold text-brand-2">{axis}</p>
                    <ul>
                      {items.map((row) => {
                        const checked = selectedIds.has(row.id);
                        return (
                          <li key={row.id}>
                            <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-surface-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => toggle(row, e.target.checked)}
                                className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-brand)]"
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
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
