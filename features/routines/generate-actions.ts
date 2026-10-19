"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  clampTrainingDays,
  generateRoutines,
  isTrainingFocus,
  isTrainingGoal,
  isTrainingLevel,
  type KnownExercise,
} from "@/features/routines/generate"
import { isMuscleGroup } from "@/features/routines/muscle-groups"
import { createExercise } from "@/features/routines/actions"
import type { RoutineFormState } from "@/features/routines/types"
import { revalidateUserViews } from "@/lib/revalidate-user"
import { getRequestAuth } from "@/lib/supabase/request-auth"

export async function generateTrainingPlan(
  _previous: RoutineFormState,
  formData: FormData,
): Promise<RoutineFormState> {
  const objetivo = String(formData.get("objetivo") ?? "")
  const nivel = String(formData.get("nivel") ?? "")
  const enfoque = String(formData.get("enfoque") ?? "")
  const dias = clampTrainingDays(Number(formData.get("dias")))

  if (!isTrainingGoal(objetivo) || !isTrainingLevel(nivel) || !isTrainingFocus(enfoque)) {
    return { error: "Elige objetivo, nivel y enfoque." }
  }

  const { supabase, user } = await getRequestAuth()
  if (!user) redirect("/auth/login")

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      objetivo,
      nivel,
      dias_por_semana: dias,
      enfoque,
    })
    .eq("id", user.id)

  if (profileError) {
    return { error: "No se pudieron guardar tus datos. Aplica la migración nueva en Supabase." }
  }

  const { data: catalogRows } = await supabase
    .from("exercises")
    .select("id, nombre, grupo_muscular")

  const catalog: KnownExercise[] = []
  const ids = new Map<string, string>()
  for (const row of catalogRows ?? []) {
    if (!isMuscleGroup(row.grupo_muscular)) continue
    catalog.push({ nombre: row.nombre, grupo: row.grupo_muscular })
    ids.set(row.nombre.toLocaleLowerCase("es"), row.id)
  }

  const plan = generateRoutines({ objetivo, nivel, dias, enfoque }, catalog)

  for (const routine of plan) {
    for (const exercise of routine.ejercicios) {
      const key = exercise.nombre.toLocaleLowerCase("es")
      if (ids.has(key)) continue
      const created = await createExercise({
        nombre: exercise.nombre,
        grupoMuscular: exercise.grupo,
      })
      if ("error" in created) return created
      ids.set(key, created.exercise.id)
    }
  }

  const { data: existingRows } = await supabase.from("routines").select("nombre")
  const existing = new Set(
    (existingRows ?? []).map((row) => row.nombre.toLocaleLowerCase("es")),
  )

  let createdRoutines = 0
  for (const routine of plan) {
    if (existing.has(routine.nombre.toLocaleLowerCase("es"))) continue

    const { data: inserted, error } = await supabase
      .from("routines")
      .insert({ user_id: user.id, nombre: routine.nombre })
      .select("id")
      .single()

    if (error || !inserted) {
      return { error: "No se pudo crear la rutina." }
    }

    const rows = routine.ejercicios.flatMap((exercise, index) => {
      const exerciseId = ids.get(exercise.nombre.toLocaleLowerCase("es"))
      if (!exerciseId) return []
      return [
        {
          routine_id: inserted.id,
          exercise_id: exerciseId,
          orden: index + 1,
          series_objetivo: exercise.series,
        },
      ]
    })

    const { error: linkError } = await supabase.from("routine_exercises").insert(rows)
    if (linkError) {
      await supabase.from("routines").delete().eq("id", inserted.id)
      return { error: "No se pudieron guardar los ejercicios de la rutina." }
    }

    createdRoutines += 1
  }

  revalidatePath("/routines")
  revalidatePath("/workout")
  revalidateUserViews(user.id)

  if (createdRoutines === 0) {
    return { error: "Esas rutinas ya están en tu lista." }
  }

  return { redirectTo: "/routines" }
}
