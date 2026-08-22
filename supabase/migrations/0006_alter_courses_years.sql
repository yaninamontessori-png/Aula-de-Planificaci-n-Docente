-- Cambiar columna 'year' a 'years' como array
alter table public.courses
  drop column year,
  add column years text[] not null default ARRAY[]::text[];
