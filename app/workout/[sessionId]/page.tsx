import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { finishWorkout } from "@/features/workouts/actions"
import { ExerciseLogger } from "@/features/workouts/exercise-logger"
import { formatSessionDate } from "@/features/history/format"
import { isMuscleGroup } from "@/features/routines/muscle-groups"
import { createClient } from "@/lib/supabase/server"

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
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: session } = await supabase
    .from("workout_sessions")
    .select("id, fecha, routine_id, routines(nombre)")
    .eq("id", sessionId)
    .maybeSingle()

  if (!session) {
    redirect("/workout")
  }

  const routine = one(session.routines as RoutineEmbed)
  const { data: routineExercises } = session.routine_id
    ? await supabase
        .from("routine_exercises")
        .select("orden, exercise_id, exercises(nombre, grupo_muscular)")
        .eq("routine_id", session.routine_id)
        .order("orden")
    : { data: [] }

  const { data: setRows } = await supabase
    .from("session_sets")
    .select("exercise_id, numero_serie, peso, repeticiones, created_at")
    .eq("session_id", sessionId)
    .order("numero_serie")

  const sets = (setRows ?? []) as (SetRow & { created_at: string })[]
  const exercises = (routineExercises ?? []).flatMap((item) => {
    const exercise = one(item.exercises as ExerciseEmbed)
    if (!exercise) return []
    return [
      {
        id: item.exercise_id,
        nombre: exercise.nombre,
        grupo: isMuscleGroup(exercise.grupo_muscular)
          ? exercise.grupo_muscular
          : null,
      },
    ]
  })

  const exerciseIds = exercises.map((exercise) => exercise.id)
  const { data: historyRows } = exerciseIds.length
    ? await supabase
        .from("session_sets")
        .select("exercise_id, peso, repeticiones, created_at")
        .in("exercise_id", exerciseIds)
        .order("created_at", { ascending: false })
    : { data: [] }

  const suggestions = new Map<string, { peso: number; repeticiones: number }>()
  for (const row of historyRows ?? []) {
    if (suggestions.has(row.exercise_id)) continue
    suggestions.set(row.exercise_id, {
      peso: Number(row.peso),
      repeticiones: row.repeticiones,
    })
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pt-8 pb-28">
      <header className="space-y-1">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {formatSessionDate(session.fecha)}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {routine?.nombre ?? "Entrenamiento"}
        </h1>
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
          const suggestion = suggestions.get(exercise.id)

          return (
            <ExerciseLogger
              key={exercise.id}
              sessionId={session.id}
              exerciseId={exercise.id}
              nombre={exercise.nombre}
              grupo={exercise.grupo}
              sets={logged}
              suggestedPeso={suggestion?.peso ?? 20}
              suggestedReps={suggestion?.repeticiones ?? 8}
            />
          )
        })
      )}

      <div className="fixed inset-x-0 bottom-0 border-t bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <form action={finishWorkout} className="mx-auto w-full max-w-md">
          <input type="hidden" name="sessionId" value={session.id} />
          <Button type="submit" variant="outline" size="touch" className="w-full">
            Finalizar sesión
          </Button>
        </form>
      </div>
    </main>
  )
}
