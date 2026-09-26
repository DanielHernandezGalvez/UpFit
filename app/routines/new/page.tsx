import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { isMuscleGroup } from "@/features/routines/muscle-groups"
import { RoutineForm } from "@/features/routines/routine-form"
import type { ExerciseOption } from "@/features/routines/types"

export default async function NewRoutinePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data } = await supabase
    .from("exercises")
    .select("id, nombre, grupo_muscular")
    .order("nombre")

  const exercises: ExerciseOption[] = (data ?? []).flatMap((exercise) =>
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

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-8 pb-40 md:max-w-3xl md:pb-28">
      <header className="mb-6 space-y-2">
        <Link
          href="/routines"
          className="text-base font-medium text-foreground underline underline-offset-4"
        >
          Rutinas
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Crear rutina</h1>
      </header>
      <RoutineForm exercises={exercises} />
    </main>
  )
}
