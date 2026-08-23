-- Asegurar que las políticas RLS de plans estén correctas
drop policy if exists "Usuarios ven sus propias planificaciones" on public.plans;
drop policy if exists "Usuarios crean sus propias planificaciones" on public.plans;
drop policy if exists "Usuarios editan sus propias planificaciones" on public.plans;
drop policy if exists "Usuarios eliminan sus propias planificaciones" on public.plans;

-- Habilitar RLS si no está habilitado
alter table public.plans enable row level security;

-- Política: ver propias planificaciones
create policy "Usuarios ven sus propias planificaciones"
  on public.plans for select
  using (auth.uid() = user_id);

-- Política: crear planificaciones propias
create policy "Usuarios crean sus propias planificaciones"
  on public.plans for insert
  with check (auth.uid() = user_id);

-- Política: editar propias planificaciones
create policy "Usuarios editan sus propias planificaciones"
  on public.plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Política: eliminar propias planificaciones
create policy "Usuarios eliminan sus propias planificaciones"
  on public.plans for delete
  using (auth.uid() = user_id);
