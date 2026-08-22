-- =============================================================================
-- Migración 0004 — Onboarding (primera vez)
--
-- `onboarded` indica si la docente ya completó sus datos iniciales. Mientras sea
-- false, la app muestra el modal de bienvenida para completar el perfil.
-- Se marca como completado a quienes ya tenían datos cargados, para no
-- molestar a usuarias existentes.
-- =============================================================================
alter table public.profiles
  add column if not exists onboarded boolean not null default false;

update public.profiles
  set onboarded = true
  where onboarded = false
    and (institution is not null or default_grade is not null);
