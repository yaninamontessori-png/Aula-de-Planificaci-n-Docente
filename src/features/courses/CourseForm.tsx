"use client";

import { useState } from "react";
import { createCourse, updateCourse, type Course } from "./actions";
import Button from "@/components/ui/Button";

interface CourseFormProps {
  course?: Course;
  onSuccess?: () => void;
}

export function CourseForm({ course, onSuccess }: CourseFormProps) {
  const [formData, setFormData] = useState({
    name: course?.name || "",
    year: course?.year || "",
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
      if (course) {
        await updateCourse(course.id, {
          name: formData.name,
          year: formData.year,
          student_count: formData.student_count ? parseInt(formData.student_count) : null,
          notes: formData.notes || undefined,
        });
      } else {
        await createCourse({
          name: formData.name,
          year: formData.year,
          student_count: formData.student_count ? parseInt(formData.student_count) : undefined,
          notes: formData.notes || undefined,
        });
      }
      setFormData({ name: "", year: "", student_count: "", notes: "" });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
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
            Año/Grado *
          </label>
          <input
            type="text"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            placeholder="Ej: 1er año, 2do año, 5to grado"
            required
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted focus:border-brand focus:outline-none"
          />
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
