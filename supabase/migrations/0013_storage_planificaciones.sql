-- Almacenamiento de los PDF de planificaciones
-- Bucket privado; el acceso para compartir se hace con URLs firmadas.

-- 1) Crear el bucket (privado)
insert into storage.buckets (id, name, public)
values ('planificaciones', 'planificaciones', false)
on conflict (id) do nothing;

-- 2) Políticas RLS sobre storage.objects para ese bucket.
--    Cada docente sube/lee/actualiza/borra únicamente sus propios PDF.
--    (Las URLs firmadas para compartir omiten RLS al leer.)

drop policy if exists "planif_insert_own" on storage.objects;
create policy "planif_insert_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'planificaciones' and owner = auth.uid());

drop policy if exists "planif_select_own" on storage.objects;
create policy "planif_select_own"
  on storage.objects for select to authenticated
  using (bucket_id = 'planificaciones' and owner = auth.uid());

drop policy if exists "planif_update_own" on storage.objects;
create policy "planif_update_own"
  on storage.objects for update to authenticated
  using (bucket_id = 'planificaciones' and owner = auth.uid())
  with check (bucket_id = 'planificaciones' and owner = auth.uid());

drop policy if exists "planif_delete_own" on storage.objects;
create policy "planif_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'planificaciones' and owner = auth.uid());
