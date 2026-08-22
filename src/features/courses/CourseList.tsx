"use client";

import { useState } from "react";
import { deleteCourse, type Course } from "./actions";
import { Button } from "@/components/ui/Button";

interface CourseListProps {
  courses: Course[];
  onEdit?: (course: Course) => void;
  onRefresh?: () => void;
}

export function CourseList({ courses, onEdit, onRefresh }: CourseListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de que querés eliminar este curso?")) return;

    setDeleting(id);
    try {
      await deleteCourse(id);
      onRefresh?.();
    } finally {
      setDeleting(null);
    }
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface/50 p-8 text-center">
        <p className="text-muted">No tenés cursos registrados aún.</p>
        <p className="mt-1 text-sm text-muted">Agregá tu primer curso arriba.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {courses.map((course) => (
        <div
          key={course.id}
          className="rounded-lg border border-border bg-surface p-4 hover:bg-surface/50 transition"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{course.name}</h3>
              <p className="text-sm text-muted">
                {course.years.join(", ")}
                {course.student_count && ` • ${course.student_count} alumnos`}
              </p>
              {course.notes && (
                <p className="mt-2 text-sm text-muted italic">{course.notes}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit?.(course)}
                className="rounded-md px-3 py-1 text-xs font-medium text-brand hover:bg-brand/10 transition"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(course.id)}
                disabled={deleting === course.id}
                className="rounded-md px-3 py-1 text-xs font-medium text-danger hover:bg-danger/10 transition disabled:opacity-50"
              >
                {deleting === course.id ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
