"use client";

import { useEffect, useState } from "react";
import { getCourses, type Course } from "@/features/courses/actions";
import { CourseForm } from "@/features/courses/CourseForm";
import { CourseList } from "@/features/courses/CourseList";

export default function MiCursoPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  async function loadCourses() {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="font-heading text-3xl font-bold text-brand mb-2">Mis cursos</h1>
      <p className="text-muted mb-8">
        Registrá aquí los cursos que dictás. Solo necesitamos el nombre, año y si hay
        particularidades.
      </p>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {editingCourse ? "Editar curso" : "Agregar nuevo curso"}
            </h2>
            <CourseForm
              course={editingCourse || undefined}
              onSuccess={() => {
                setEditingCourse(null);
                loadCourses();
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Tus cursos ({courses.length})
          </h2>
          {loading ? (
            <p className="text-muted">Cargando...</p>
          ) : (
            <CourseList
              courses={courses}
              onEdit={setEditingCourse}
              onRefresh={loadCourses}
            />
          )}
        </div>
      </div>
    </main>
  );
}
