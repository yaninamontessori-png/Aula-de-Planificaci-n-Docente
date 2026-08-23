-- Arreglar el guardado del perfil (onboarding): faltaba la política de INSERT.
-- Con RLS activa, el upsert necesita permiso de INSERT cuando la fila de perfil
-- todavía no existe.

drop policy if exists "Usuarios crean su perfil" on public.profiles;
create policy "Usuarios crean su perfil"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

-- Reasegurar el trigger que crea el perfil al registrarse (por si faltaba).
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
