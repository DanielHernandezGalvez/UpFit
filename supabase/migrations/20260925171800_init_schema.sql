-- Work Track: esquema inicial y RLS.
-- Cada usuario solo puede ver y modificar sus propios datos.
-- Aplicar en el SQL Editor de Supabase o con `supabase db push`.

-- ---------------------------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  created_at timestamptz not null default now(),
  constraint profiles_nombre_not_blank check (
    char_length(btrim(nombre)) > 0
    and nombre = btrim(nombre)
  )
);

-- Crea el perfil al registrarse. El nombre llega en raw_user_meta_data.nombre
-- desde el signUp del cliente. Si no viene, usa la parte local del email.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nombre)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'nombre'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Usuario'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Catálogo de ejercicios
-- ---------------------------------------------------------------------------

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null,
  grupo_muscular text not null,
  constraint exercises_nombre_not_blank check (
    char_length(btrim(nombre)) > 0
    and nombre = btrim(nombre)
  ),
  constraint exercises_grupo_muscular_check check (
    grupo_muscular in (
      'Pecho',
      'Espalda',
      'Hombro',
      'Tríceps',
      'Bíceps',
      'Pierna'
    )
  )
);

create unique index exercises_user_nombre_lower_idx
  on public.exercises (user_id, lower(nombre));

-- ---------------------------------------------------------------------------
-- Rutinas
-- ---------------------------------------------------------------------------

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null,
  created_at timestamptz not null default now(),
  constraint routines_nombre_not_blank check (
    char_length(btrim(nombre)) > 0
    and nombre = btrim(nombre)
  )
);

create index routines_user_id_idx on public.routines (user_id);

create table public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  orden integer not null,
  constraint routine_exercises_orden_positive check (orden >= 1),
  constraint routine_exercises_routine_orden_key unique (routine_id, orden),
  constraint routine_exercises_routine_exercise_key unique (routine_id, exercise_id)
);

create index routine_exercises_exercise_id_idx
  on public.routine_exercises (exercise_id);

-- ---------------------------------------------------------------------------
-- Sesiones y series
-- fecha la envía el cliente con el día local del entrenamiento.
-- Supabase guarda timestamptz en UTC y current_date puede caer en el día
-- siguiente para una sesión nocturna.
-- ---------------------------------------------------------------------------

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_id uuid references public.routines (id) on delete set null,
  fecha date not null,
  created_at timestamptz not null default now()
);

create index workout_sessions_user_id_fecha_idx
  on public.workout_sessions (user_id, fecha desc);

create index workout_sessions_routine_id_idx
  on public.workout_sessions (routine_id);

-- Borrar un ejercicio también borra sus series. Así, si se elimina el usuario
-- en Authentication, la cascada no se bloquea con series históricas.
create table public.session_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  numero_serie integer not null,
  peso numeric(6, 2) not null,
  repeticiones integer not null,
  created_at timestamptz not null default now(),
  constraint session_sets_numero_serie_positive check (numero_serie >= 1),
  constraint session_sets_peso_nonnegative check (peso >= 0),
  constraint session_sets_repeticiones_positive check (repeticiones >= 1),
  constraint session_sets_session_exercise_serie_key unique (session_id, exercise_id, numero_serie)
);

create index session_sets_exercise_id_idx
  on public.session_sets (exercise_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.session_sets enable row level security;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.exercises to authenticated;
grant select, insert, update, delete on table public.routines to authenticated;
grant select, insert, update, delete on table public.routine_exercises to authenticated;
grant select, insert, update, delete on table public.workout_sessions to authenticated;
grant select, insert, update, delete on table public.session_sets to authenticated;

-- profiles
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy profiles_delete_own
  on public.profiles
  for delete
  to authenticated
  using (id = (select auth.uid()));

-- exercises
create policy exercises_select_own
  on public.exercises
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy exercises_insert_own
  on public.exercises
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy exercises_update_own
  on public.exercises
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy exercises_delete_own
  on public.exercises
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- routines
create policy routines_select_own
  on public.routines
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy routines_insert_own
  on public.routines
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy routines_update_own
  on public.routines
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy routines_delete_own
  on public.routines
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- routine_exercises: la rutina y el ejercicio tienen que ser del mismo usuario
create policy routine_exercises_select_own
  on public.routine_exercises
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.routines r
      where r.id = routine_id
        and r.user_id = (select auth.uid())
    )
  );

create policy routine_exercises_insert_own
  on public.routine_exercises
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.routines r
      where r.id = routine_id
        and r.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.exercises e
      where e.id = exercise_id
        and e.user_id = (select auth.uid())
    )
  );

create policy routine_exercises_update_own
  on public.routine_exercises
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.routines r
      where r.id = routine_id
        and r.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.routines r
      where r.id = routine_id
        and r.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.exercises e
      where e.id = exercise_id
        and e.user_id = (select auth.uid())
    )
  );

create policy routine_exercises_delete_own
  on public.routine_exercises
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.routines r
      where r.id = routine_id
        and r.user_id = (select auth.uid())
    )
  );

-- workout_sessions: routine_id puede ser null; si viene, la rutina es del usuario
create policy workout_sessions_select_own
  on public.workout_sessions
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy workout_sessions_insert_own
  on public.workout_sessions
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      routine_id is null
      or exists (
        select 1
        from public.routines r
        where r.id = routine_id
          and r.user_id = (select auth.uid())
      )
    )
  );

create policy workout_sessions_update_own
  on public.workout_sessions
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      routine_id is null
      or exists (
        select 1
        from public.routines r
        where r.id = routine_id
          and r.user_id = (select auth.uid())
      )
    )
  );

create policy workout_sessions_delete_own
  on public.workout_sessions
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- session_sets: la sesión y el ejercicio tienen que ser del usuario
create policy session_sets_select_own
  on public.session_sets
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

create policy session_sets_insert_own
  on public.session_sets
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

create policy session_sets_update_own
  on public.session_sets
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

create policy session_sets_delete_own
  on public.session_sets
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
