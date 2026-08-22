create table public.courses (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  years text[] not null,
  student_count integer,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id),
  foreign key (user_id) references auth.users (id) on delete cascade
);

alter table public.courses enable row level security;

create policy "Usuarios ven solo sus cursos"
  on public.courses for select
  using (auth.uid() = user_id);

create policy "Usuarios crean cursos propios"
  on public.courses for insert
  with check (auth.uid() = user_id);

create policy "Usuarios editan sus propios cursos"
  on public.courses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuarios eliminan sus propios cursos"
  on public.courses for delete
  using (auth.uid() = user_id);
