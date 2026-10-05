import { redirect } from "next/navigation"

import { ExerciseLogger } from "@/features/workouts/exercise-logger"
import { SessionExtras } from "@/features/workouts/session-extras"
import { formatSessionDate } from "@/features/history/format"
import { isMuscleGroup } from "@/features/routines/muscle-groups"
import { getRequestAuth } from "@/lib/supabase/request-auth"

type ExerciseEmbed = {
  nombre: string
  grupo_muscular: string
} | {
  nombre: string
  grupo_muscular: string
}[] | null

type RoutineEmbed = { nombre: string } | { nombre: string }[] | null

type SetRow = {
  exercise_id: string
  numero_serie: number
  peso: number | string
  repeticiones: number
}

function one<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

export default async function WorkoutSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>
  searchParams: Promise<{ aviso?: string }>
}) {
  const { sessionId } = await params
  const { aviso } = await searchParams
  const { supabase, user } = await getRequestAuth()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: session } = await supabase
    .from("workout_sessions")
    .select("id, fecha, created_at, routine_id, routines(nombre)")
    .eq("id", sessionId)
    .maybeSingle()

  if (!session) {
    redirect("/workout")
  }

  const routine = one(session.routines as RoutineEmbed)
  const { data: sessionPlan } = await supabase
    .from("session_exercises")
    .select("orden, exercise_id, series_objetivo, exercises(nombre, grupo_muscular)")
    .eq("session_id", sessionId)
    .order("orden")

  const { data: routineExercises } =
    sessionPlan?.length || !session.routine_id
      ? { data: [] }
      : await supabase
          .from("routine_exercises")
          .select("orden, exercise_id, series_objetivo, exercises(nombre, grupo_muscular)")
          .eq("routine_id", session.routine_id)
          .order("orden")

  const planned = (sessionPlan?.length ? sessionPlan : routineExercises) ?? []

  const { data: setRows } = await supabase
    .from("session_sets")
    .select("exercise_id, numero_serie, peso, repeticiones, created_at")
    .eq("session_id", sessionId)
    .order("numero_serie")

  const sets = (setRows ?? []) as (SetRow & { created_at: string })[]
  const exercises = planned.flatMap((item) => {
    const exercise = one(item.exercises as ExerciseEmbed)
    if (!exercise) return []
    return [
      {
        id: item.exercise_id,
        orden: item.orden,
        seriesObjetivo: item.series_objetivo ?? 3,
        nombre: exercise.nombre,
        grupo: isMuscleGroup(exercise.grupo_muscular)
          ? exercise.grupo_muscular
          : null,
      },
    ]
  })

  const { data: catalogRows } = await supabase
    .from("exercises")
    .select("id, nombre")
    .order("nombre")
  const catalog = catalogRows ?? []

  const { data: cardioRows } = await supabase
    .from("session_cardio")
    .select("id, tipo, minutos")
    .eq("session_id", sessionId)
    .order("created_at")

  const previousByExercise = new Map<string, { peso: number; repeticiones: number }[]>()
  if (session.routine_id) {
    const { data: previousSessions } = await supabase
      .from("workout_sessions")
      .select("id")
      .eq("routine_id", session.routine_id)
      .neq("id", sessionId)
      .order("fecha", { ascending: false })
      .limit(5)
    const previousIds = (previousSessions ?? []).map((item) => item.id)
    const { data: previousRows } = previousIds.length
      ? await supabase
          .from("session_sets")
          .select("session_id, exercise_id, numero_serie, peso, repeticiones")
          .in("session_id", previousIds)
          .order("numero_serie")
      : { data: [] }
    const newestSessionId = previousIds.find((id) =>
      (previousRows ?? []).some((row) => row.session_id === id),
    )
    for (const row of previousRows ?? []) {
      if (row.session_id !== newestSessionId) continue
      const list = previousByExercise.get(row.exercise_id) ?? []
      list.push({ peso: Number(row.peso), repeticiones: row.repeticiones })
      previousByExercise.set(row.exercise_id, list)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pt-8 pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:max-w-3xl md:pb-10">
      <header className="space-y-1">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {formatSessionDate(session.fecha)}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {routine?.nombre ?? "Entrenamiento"}
        </h1>
        {aviso === "repetido" ? (
          <p className="text-sm text-destructive">Ese ejercicio ya está en la rutina.</p>
        ) : null}
      </header>

      {exercises.length === 0 ? (
        <p className="text-base leading-relaxed text-muted-foreground">
          Esta rutina no tiene ejercicios. Agrégalos antes de anotar series.
        </p>
      ) : (
        exercises.map((exercise) => {
          const logged = sets
            .filter((set) => set.exercise_id === exercise.id)
            .map((set) => ({
              numero_serie: set.numero_serie,
              peso: Number(set.peso),
              repeticiones: set.repeticiones,
            }))
          return (
            <ExerciseLogger
              key={`${exercise.orden}-${exercise.id}`}
              sessionId={session.id}
              exerciseId={exercise.id}
              orden={exercise.orden}
              nombre={exercise.nombre}
              grupo={exercise.grupo}
              sets={logged}
              seriesObjetivo={exercise.seriesObjetivo}
              previousSets={previousByExercise.get(exercise.id) ?? []}
              catalog={catalog}
              canChange={Boolean(sessionPlan?.length)}
            />
          )
        })
      )}

      <SessionExtras
        sessionId={session.id}
        createdAt={session.created_at}
        cardio={cardioRows ?? []}
      />
    </main>
  )
}
