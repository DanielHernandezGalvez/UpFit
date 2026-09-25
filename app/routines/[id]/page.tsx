import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { isMuscleGroup } from "@/features/routines/muscle-groups"
import { RoutineForm } from "@/features/routines/routine-form"
import type { ExerciseOption } from "@/features/routines/types"

export default async function EditRoutinePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [{ data: routine }, { data: catalog }] = await Promise.all([
    supabase
      .from("routines")
      .select("id, nombre, routine_exercises(exercise_id, orden)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("exercises").select("id, nombre, grupo_muscular").order("nombre"),
  ])

  if (!routine) {
    redirect("/routines")
  }

  const exercises: ExerciseOption[] = (catalog ?? []).flatMap((exercise) =>
    isMuscleGroup(exercise.grupo_muscular)
      ? [
          {
            id: exercise.id,
            nombre: exercise.nombre,
            grupo_muscular: exercise.grupo_muscular,
          },
        ]
      : [],
  )

  const initialExerciseIds = [...(routine.routine_exercises ?? [])]
    .sort((a, b) => a.orden - b.orden)
    .map((item) => item.exercise_id)

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-8 pb-28">
      <header className="mb-6 space-y-2">
        <Link
          href="/routines"
          className="text-base font-medium text-foreground underline underline-offset-4"
        >
          Rutinas
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Editar rutina</h1>
      </header>
      <RoutineForm
        routineId={routine.id}
        initialName={routine.nombre}
        initialExerciseIds={initialExerciseIds}
        exercises={exercises}
      />
    </main>
  )
}
