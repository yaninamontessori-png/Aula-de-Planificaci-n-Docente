"use client";

import { useState } from "react";
import { createCourse, updateCourse, type Course } from "./actions";
import { Button } from "@/components/ui/Button";

const AVAILABLE_YEARS = [
  "Sala 3",
  "Sala 4",
  "Sala 5",
  "1er grado",
  "2do grado",
  "3er grado",
  "4to grado",
  "5to grado",
  "6to grado",
  "1er año",
  "2do año",
  "3er año",
  "4to año",
  "5to año",
  "6to año",
];

interface CourseFormProps {
  course?: Course;
  onSuccess?: () => void;
}

export function CourseForm({ course, onSuccess }: CourseFormProps) {
  const [formData, setFormData] = useState({
    name: course?.name || "",
    years: course?.years || [],
    student_count: course?.student_count || "",
    notes: course?.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.years.length === 0) {
        setError("Debés seleccionar al menos un grado");
        setLoading(false);
        return;
      }

      if (course) {
        await updateCourse(course.id, {
          name: formData.name,
          years: formData.years,
          student_count: formData.student_count ? parseInt(String(formData.student_count)) : undefined,
          notes: formData.notes || undefined,
        } as any);
      } else {
        await createCourse({
          name: formData.name,
          years: formData.years,
          student_count: formData.student_count ? parseInt(String(formData.student_count)) : undefined,
          notes: formData.notes || undefined,
        } as any);
      }
      setFormData({ name: "", years: [], student_count: "", notes: "" });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  function toggleYear(year: string) {
    setFormData((prev) => ({
      ...prev,
      years: prev.years.includes(year)
        ? prev.years.filter((y) => y !== year)
        : [...prev.years, year],
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-surface p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Nombre del curso/materia *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Educación Física, Música, Lengua"
            required
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Años/Grados * (podés elegir más de uno)
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AVAILABLE_YEARS.map((year) => (
              <label key={year} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.years.includes(year)}
                  onChange={() => toggleYear(year)}
                  className="rounded border-border"
                />
                <span className="text-sm text-foreground">{year}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Cantidad de alumnos (opcional)
          </label>
          <input
            type="number"
            value={formData.student_count}
            onChange={(e) => setFormData({ ...formData, student_count: e.target.value })}
            placeholder="Ej: 25"
            min="0"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Particularidades/Adaptaciones (opcional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Ej: Grupo con alumnos con necesidades especiales, 3 alumnos con adaptación curricular..."
            rows={3}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted focus:border-brand focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Guardando..." : course ? "Actualizar curso" : "Agregar curso"}
        </Button>
      </div>
    </form>
  );
}
