-- Datos de entrenamiento para armar rutinas sugeridas.

alter table public.profiles
  add column if not exists objetivo text,
  add column if not exists nivel text,
  add column if not exists dias_por_semana integer,
  add column if not exists enfoque text;

alter table public.profiles
  drop constraint if exists profiles_objetivo_check;

alter table public.profiles
  add constraint profiles_objetivo_check
  check (objetivo is null or objetivo in ('Fuerza', 'Hipertrofia', 'Resistencia'));

alter table public.profiles
  drop constraint if exists profiles_nivel_check;

alter table public.profiles
  add constraint profiles_nivel_check
  check (nivel is null or nivel in ('Principiante', 'Intermedio', 'Avanzado'));

alter table public.profiles
  drop constraint if exists profiles_dias_por_semana_check;

alter table public.profiles
  add constraint profiles_dias_por_semana_check
  check (dias_por_semana is null or dias_por_semana between 2 and 6);

alter table public.profiles
  drop constraint if exists profiles_enfoque_check;

alter table public.profiles
  add constraint profiles_enfoque_check
  check (
    enfoque is null
    or enfoque in ('Cuerpo completo', 'Empuje y tirón', 'Torso y pierna')
  );
