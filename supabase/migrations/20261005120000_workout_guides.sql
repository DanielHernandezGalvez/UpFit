-- Guía de series, tiempo de la sesión, cardio y cambio de ejercicio durante el entrenamiento.

alter table public.routine_exercises
  add column series_objetivo integer not null default 3;

alter table public.routine_exercises
  add constraint routine_exercises_series_objetivo_check
  check (series_objetivo between 1 and 20);

alter table public.workout_sessions
  add column duracion_minutos integer;

alter table public.workout_sessions
  add constraint workout_sessions_duracion_minutos_check
  check (duracion_minutos is null or duracion_minutos between 1 and 300);

create table public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  orden integer not null,
  series_objetivo integer not null default 3,
  constraint session_exercises_orden_positive check (orden >= 1),
  constraint session_exercises_series_objetivo_check check (series_objetivo between 1 and 20),
  constraint session_exercises_session_orden_key unique (session_id, orden),
  constraint session_exercises_session_exercise_key unique (session_id, exercise_id)
);

create index session_exercises_exercise_id_idx
  on public.session_exercises (exercise_id);

alter table public.session_exercises enable row level security;

grant select, insert, update, delete on table public.session_exercises to authenticated;

create policy session_exercises_select_own
  on public.session_exercises
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workout_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
  );

create policy session_exercises_insert_own
  on public.session_exercises
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.workout_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.exercises e
      where e.id = exercise_id
        and e.user_id = (select auth.uid())
    )
  );

create policy session_exercises_update_own
  on public.session_exercises
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.workout_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.workout_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.exercises e
      where e.id = exercise_id
        and e.user_id = (select auth.uid())
    )
  );

create policy session_exercises_delete_own
  on public.session_exercises
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.workout_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
  );

create table public.session_cardio (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  tipo text not null,
  minutos integer not null,
  created_at timestamptz not null default now(),
  constraint session_cardio_tipo_check check (
    tipo in ('Caminadora', 'Bicicleta', 'Elíptica', 'Remo', 'Cuerda', 'Otro')
  ),
  constraint session_cardio_minutos_check check (minutos between 1 and 300)
);

create index session_cardio_session_id_idx on public.session_cardio (session_id);

alter table public.session_cardio enable row level security;

grant select, insert, delete on table public.session_cardio to authenticated;

create policy session_cardio_select_own
  on public.session_cardio
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workout_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
  );

create policy session_cardio_insert_own
  on public.session_cardio
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.workout_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
  );

create policy session_cardio_delete_own
  on public.session_cardio
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.workout_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
  );

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
    select re.exercise_id, re.orden, re.series_objetivo
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

    insert into public.routine_exercises (routine_id, exercise_id, orden, series_objetivo)
    values (new_routine_id, target_exercise_id, next_orden, link.series_objetivo);

    next_orden := next_orden + 1;
  end loop;

  return new_routine_id;
end;
$$;
