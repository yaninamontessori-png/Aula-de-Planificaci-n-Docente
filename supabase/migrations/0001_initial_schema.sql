-- =============================================================================
-- Aula de Planificación Docente — Esquema inicial
-- Migración 0001: tablas, enums, índices, triggers y RLS.
--
-- Convenciones de seguridad:
--   * RLS ACTIVADA en todas las tablas expuestas por PostgREST.
--   * Las políticas comparan auth.uid() contra user_id (nunca user_metadata).
--   * Las políticas UPDATE incluyen USING y WITH CHECK.
--   * curriculum_contents es de solo lectura para usuarios autenticados.
--   * La service role key (solo backend) omite RLS para importar/registrar.
-- =============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Tipos enumerados del dominio
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.planning_type as enum ('unidad_mensual', 'secuencia_clases');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.plan_status as enum ('borrador', 'completo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.generation_status as enum ('pendiente', 'exito', 'error');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Utilidad: mantener updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: datos mínimos de la docente, 1:1 con auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  institution  text,
  province     text        not null default 'Santa Fe',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crea el perfil automáticamente al registrarse (prefill NO usado para autorización).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- curriculum_contents: Diseño Curricular (Santa Fe). Solo lectura para docentes.
-- content_hash permite importaciones idempotentes (upsert) desde CSV.
-- ---------------------------------------------------------------------------
create table if not exists public.curriculum_contents (
  id             uuid primary key default gen_random_uuid(),
  jurisdiction   text     not null default 'Santa Fe',
  level          text     not null default 'primaria',
  grade          smallint not null check (grade between 1 and 7),
  area           text     not null,
  axis           text,
  content_number text,
  content_text   text     not null,
  source_year    smallint,
  active         boolean  not null default true,
  content_hash   text     not null unique,
  created_at     timestamptz not null default now()
);

create index if not exists idx_curriculum_grade_area
  on public.curriculum_contents (grade, area, axis)
  where active;

-- ---------------------------------------------------------------------------
-- plans: cada planificación pertenece a una docente (user_id).
-- ---------------------------------------------------------------------------
create table if not exists public.plans (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  teacher_name       text not null,
  institution        text,
  grade              smallint not null check (grade between 1 and 7),
  planning_type      public.planning_type not null,
  duration           text,
  start_date         date,
  title              text not null,
  guiding_question   text not null,
  teacher_resource   text,
  generated_sections jsonb not null default '{}'::jsonb,
  status             public.plan_status not null default 'borrador',
  ai_model           text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_plans_user_created
  on public.plans (user_id, created_at desc);

drop trigger if exists trg_plans_updated_at on public.plans;
create trigger trg_plans_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- plan_contents: relación N:M plan <-> contenido curricular.
-- ---------------------------------------------------------------------------
create table if not exists public.plan_contents (
  plan_id               uuid not null references public.plans (id) on delete cascade,
  curriculum_content_id uuid not null references public.curriculum_contents (id) on delete restrict,
  primary key (plan_id, curriculum_content_id)
);

create index if not exists idx_plan_contents_content
  on public.plan_contents (curriculum_content_id);

-- ---------------------------------------------------------------------------
-- generation_events: auditoría de llamadas a la IA.
-- ---------------------------------------------------------------------------
create table if not exists public.generation_events (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  plan_id       uuid references public.plans (id) on delete set null,
  status        public.generation_status not null,
  model         text,
  error_code    text,
  input_tokens  integer,
  output_tokens integer,
  created_at    timestamptz not null default now()
);

create index if not exists idx_generation_events_user
  on public.generation_events (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- usage_limits: control opcional de cuota mensual (nivel gratuito).
-- ---------------------------------------------------------------------------
create table if not exists public.usage_limits (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  period_start     date    not null default date_trunc('month', now())::date,
  generations_used integer not null default 0,
  monthly_limit    integer not null default 50,
  updated_at       timestamptz not null default now()
);

drop trigger if exists trg_usage_limits_updated_at on public.usage_limits;
create trigger trg_usage_limits_updated_at
  before update on public.usage_limits
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles            enable row level security;
alter table public.curriculum_contents enable row level security;
alter table public.plans               enable row level security;
alter table public.plan_contents       enable row level security;
alter table public.generation_events   enable row level security;
alter table public.usage_limits        enable row level security;

-- profiles: cada docente solo su propia fila -------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- curriculum_contents: lectura para autenticados ---------------------------
drop policy if exists "curriculum_select_authenticated" on public.curriculum_contents;
create policy "curriculum_select_authenticated" on public.curriculum_contents
  for select to authenticated using (active);

-- plans: CRUD solo del propio user_id --------------------------------------
drop policy if exists "plans_select_own" on public.plans;
create policy "plans_select_own" on public.plans
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "plans_insert_own" on public.plans;
create policy "plans_insert_own" on public.plans
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "plans_update_own" on public.plans;
create policy "plans_update_own" on public.plans
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "plans_delete_own" on public.plans;
create policy "plans_delete_own" on public.plans
  for delete to authenticated using ((select auth.uid()) = user_id);

-- plan_contents: se valida la propiedad del plan asociado -------------------
drop policy if exists "plan_contents_select_own" on public.plan_contents;
create policy "plan_contents_select_own" on public.plan_contents
  for select to authenticated using (
    exists (
      select 1 from public.plans p
      where p.id = plan_contents.plan_id and p.user_id = (select auth.uid())
    )
  );

drop policy if exists "plan_contents_insert_own" on public.plan_contents;
create policy "plan_contents_insert_own" on public.plan_contents
  for insert to authenticated with check (
    exists (
      select 1 from public.plans p
      where p.id = plan_contents.plan_id and p.user_id = (select auth.uid())
    )
  );

drop policy if exists "plan_contents_delete_own" on public.plan_contents;
create policy "plan_contents_delete_own" on public.plan_contents
  for delete to authenticated using (
    exists (
      select 1 from public.plans p
      where p.id = plan_contents.plan_id and p.user_id = (select auth.uid())
    )
  );

-- generation_events: lectura/inserción del propio usuario -------------------
drop policy if exists "generation_events_select_own" on public.generation_events;
create policy "generation_events_select_own" on public.generation_events
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "generation_events_insert_own" on public.generation_events;
create policy "generation_events_insert_own" on public.generation_events
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- usage_limits: lectura/gestión del propio usuario --------------------------
drop policy if exists "usage_limits_select_own" on public.usage_limits;
create policy "usage_limits_select_own" on public.usage_limits
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "usage_limits_insert_own" on public.usage_limits;
create policy "usage_limits_insert_own" on public.usage_limits
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "usage_limits_update_own" on public.usage_limits;
create policy "usage_limits_update_own" on public.usage_limits
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- =============================================================================
-- Privilegios de tabla (RLS decide las filas; GRANT habilita la operación)
-- =============================================================================
grant usage on schema public to anon, authenticated;

grant select                         on public.curriculum_contents to authenticated;
grant select, insert, update         on public.profiles            to authenticated;
grant select, insert, update, delete on public.plans               to authenticated;
grant select, insert, delete         on public.plan_contents       to authenticated;
grant select, insert                 on public.generation_events   to authenticated;
grant select, insert, update         on public.usage_limits        to authenticated;
