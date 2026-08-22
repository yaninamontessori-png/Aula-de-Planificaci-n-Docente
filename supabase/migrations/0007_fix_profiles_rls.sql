-- Asegurar que las políticas RLS de profiles existan y sean correctas
drop policy if exists "Usuarios ven su perfil" on public.profiles;
drop policy if exists "Usuarios actualizan su perfil" on public.profiles;

create policy "Usuarios ven su perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuarios actualizan su perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
