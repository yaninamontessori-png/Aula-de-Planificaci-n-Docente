-- =============================================================================
-- Migración 0003 — Roles (directivo), especialidad y adaptaciones curriculares
--
--   * profiles.role             : 'docente' (por defecto) o 'directivo'.
--   * profiles.teaching_subject : especialidad (grado, música, ed. física, …).
--   * plans.curricular_adaptations : adaptaciones del grupo por planificación
--                                    (NUNCA nombres de estudiantes).
--
-- Un directivo puede LEER (solo select) las planificaciones de su MISMA
-- institución. No puede modificarlas ni borrarlas (esas políticas siguen siendo
-- solo del dueño). El rol es autodeclarado desde el Perfil: pensado para uso
-- en una institución de confianza.
-- =============================================================================
alter table public.profiles
  add column if not exists role text not null default 'docente'
    check (role in ('docente', 'directivo')),
  add column if not exists teaching_subject text;

alter table public.plans
  add column if not exists curricular_adaptations text;

-- Lectura ampliada para directivos, acotada a su institución.
drop policy if exists "plans_select_directivo" on public.plans;
create policy "plans_select_directivo" on public.plans
  for select to authenticated using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'directivo'
        and p.institution is not null
        and plans.institution is not null
        and lower(btrim(p.institution)) = lower(btrim(plans.institution))
    )
  );
