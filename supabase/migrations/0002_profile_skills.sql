-- =============================================================================
-- Migración 0002 — Configuración pedagógica del perfil
--
-- Agrega a `profiles` la configuración que orienta al agente de IA cuando
-- genera la planificación:
--   * teaching_skills   : enfoques pedagógicos elegidos por la docente ("skills").
--   * pedagogical_notes : contexto del grupo/aula en texto libre.
--   * default_grade     : grado que enseña (precarga el asistente).
-- Son columnas de la propia fila del usuario; la RLS existente (profiles_*_own)
-- ya las cubre. No requieren nuevas políticas ni grants.
-- =============================================================================
alter table public.profiles
  add column if not exists teaching_skills   text[]   not null default '{}',
  add column if not exists pedagogical_notes text,
  add column if not exists default_grade     smallint check (default_grade between 1 and 7);
