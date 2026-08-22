"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface Course {
  id: string;
  name: string;
  years: string[];
  student_count?: number;
  notes?: string;
}

export async function getCourses(): Promise<Course[]> {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`No se pudieron obtener los cursos: ${error.message}`);
  return data || [];
}

export async function createCourse(course: Omit<Course, "id">) {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("courses")
    .insert([course])
    .select()
    .single();

  if (error) throw new Error(`No se pudo crear el curso: ${error.message}`);
  revalidatePath("/mi-curso");
  return data;
}

export async function updateCourse(id: string, course: Partial<Omit<Course, "id">>) {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("courses")
    .update(course)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`No se pudo actualizar el curso: ${error.message}`);
  revalidatePath("/mi-curso");
  return data;
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();
  const { error } = await (supabase as any).from("courses").delete().eq("id", id);

  if (error) throw new Error(`No se pudo eliminar el curso: ${error.message}`);
  revalidatePath("/mi-curso");
}
