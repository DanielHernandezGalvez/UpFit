-- Compartir rutinas y registro opcional de peso y medidas.

create table public.routine_shares (
  code text primary key,
  routine_id uuid not null references public.routines (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint routine_shares_code_check check (code ~ '^[A-Z0-9]{8}$')
);

create index routine_shares_owner_id_idx on public.routine_shares (owner_id);
create index routine_shares_routine_id_idx on public.routine_shares (routine_id);

alter table public.routine_shares enable row level security;

grant select, insert, delete on table public.routine_shares to authenticated;

create policy routine_shares_select_own
  on public.routine_shares
  for select
  to authenticated
  using (owner_id = (select auth.uid()));

create policy routine_shares_insert_own
  on public.routine_shares
  for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.routines r
      where r.id = routine_id
        and r.user_id = (select auth.uid())
    )
  );

create policy routine_shares_delete_own
  on public.routine_shares
  for delete
  to authenticated
  using (owner_id = (select auth.uid()));

create or replace function public.import_shared_routine(share_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  share_row public.routine_shares%rowtype;
  source_routine public.routines%rowtype;
  new_routine_id uuid;
  link record;
  source_exercise public.exercises%rowtype;
  target_exercise_id uuid;
  next_orden integer := 1;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into share_row
  from public.routine_shares
  where code = upper(btrim(share_code));

  if share_row.code is null then
    raise exception 'code not found';
  end if;

  if share_row.owner_id = auth.uid() then
    raise exception 'own routine';
  end if;

  select * into source_routine
  from public.routines
  where id = share_row.routine_id;

  insert into public.routines (user_id, nombre)
  values (auth.uid(), source_routine.nombre)
  returning id into new_routine_id;

  for link in
    select re.exercise_id, re.orden
    from public.routine_exercises re
    where re.routine_id = source_routine.id
    order by re.orden
  loop
    select * into source_exercise
    from public.exercises
    where id = link.exercise_id;

    select e.id into target_exercise_id
    from public.exercises e
    where e.user_id = auth.uid()
      and lower(e.nombre) = lower(source_exercise.nombre)
    limit 1;

    if target_exercise_id is null then
      insert into public.exercises (user_id, nombre, grupo_muscular)
      values (auth.uid(), source_exercise.nombre, source_exercise.grupo_muscular)
      returning id into target_exercise_id;
    end if;

    insert into public.routine_exercises (routine_id, exercise_id, orden)
    values (new_routine_id, target_exercise_id, next_orden);

    next_orden := next_orden + 1;
  end loop;

  return new_routine_id;
end;
$$;

revoke all on function public.import_shared_routine(text) from public;
revoke all on function public.import_shared_routine(text) from anon;
grant execute on function public.import_shared_routine(text) to authenticated;

create table public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  fecha date not null,
  peso numeric(5, 2),
  cintura numeric(5, 1),
  pecho numeric(5, 1),
  cadera numeric(5, 1),
  brazo numeric(5, 1),
  muslo numeric(5, 1),
  created_at timestamptz not null default now(),
  constraint body_measurements_peso_check check (peso is null or peso > 0),
  constraint body_measurements_cintura_check check (cintura is null or cintura > 0),
  constraint body_measurements_pecho_check check (pecho is null or pecho > 0),
  constraint body_measurements_cadera_check check (cadera is null or cadera > 0),
  constraint body_measurements_brazo_check check (brazo is null or brazo > 0),
  constraint body_measurements_muslo_check check (muslo is null or muslo > 0),
  constraint body_measurements_has_value check (
    peso is not null
    or cintura is not null
    or pecho is not null
    or cadera is not null
    or brazo is not null
    or muslo is not null
  )
);

create index body_measurements_user_id_fecha_idx
  on public.body_measurements (user_id, fecha desc);

alter table public.body_measurements enable row level security;

grant select, insert, delete on table public.body_measurements to authenticated;

create policy body_measurements_select_own
  on public.body_measurements
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy body_measurements_insert_own
  on public.body_measurements
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy body_measurements_delete_own
  on public.body_measurements
  for delete
  to authenticated
  using (user_id = (select auth.uid()));
