-- Catálogo público: el dueño publica una rutina y otros la copian.

create table public.routine_publications (
  routine_id uuid primary key references public.routines (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  published_at timestamptz not null default now()
);

create index routine_publications_published_at_idx
  on public.routine_publications (published_at desc, routine_id);

alter table public.routine_publications enable row level security;

grant select, insert, delete on table public.routine_publications to authenticated;

create policy routine_publications_select_own
  on public.routine_publications
  for select
  to authenticated
  using (owner_id = (select auth.uid()));

create policy routine_publications_insert_own
  on public.routine_publications
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

create policy routine_publications_delete_own
  on public.routine_publications
  for delete
  to authenticated
  using (owner_id = (select auth.uid()));

create or replace function public.list_public_routines(page_limit integer, page_offset integer)
returns table (
  routine_id uuid,
  nombre text,
  autor text,
  ejercicios jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_limit integer;
  v_offset integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  v_limit := least(greatest(coalesce(page_limit, 6), 1), 6);
  v_offset := greatest(coalesce(page_offset, 0), 0);

  return query
  select
    r.id,
    r.nombre,
    coalesce(p.nombre, 'Usuario'),
    coalesce((
      select jsonb_agg(
        jsonb_build_object('nombre', e.nombre, 'series', re.series_objetivo)
        order by re.orden
      )
      from public.routine_exercises re
      join public.exercises e on e.id = re.exercise_id
      where re.routine_id = r.id
    ), '[]'::jsonb)
  from public.routine_publications pub
  join public.routines r on r.id = pub.routine_id
  left join public.profiles p on p.id = pub.owner_id
  where pub.owner_id <> (select auth.uid())
  order by pub.published_at desc, r.id
  limit v_limit
  offset v_offset;
end;
$$;

revoke all on function public.list_public_routines(integer, integer) from public;
revoke all on function public.list_public_routines(integer, integer) from anon;
grant execute on function public.list_public_routines(integer, integer) to authenticated;

create or replace function public.copy_public_routine(source_routine_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  publication public.routine_publications%rowtype;
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

  select * into publication
  from public.routine_publications
  where routine_id = source_routine_id;

  if publication.routine_id is null then
    raise exception 'not published';
  end if;

  if publication.owner_id = auth.uid() then
    raise exception 'own routine';
  end if;

  select * into source_routine
  from public.routines
  where id = publication.routine_id;

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

revoke all on function public.copy_public_routine(uuid) from public;
revoke all on function public.copy_public_routine(uuid) from anon;
grant execute on function public.copy_public_routine(uuid) to authenticated;
