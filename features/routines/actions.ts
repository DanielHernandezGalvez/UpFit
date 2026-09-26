"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isMuscleGroup } from "@/features/routines/muscle-groups"
import type { ExerciseOption, RoutineFormState } from "@/features/routines/types"
import { revalidateUserViews } from "@/lib/revalidate-user"
import { createClient } from "@/lib/supabase/server"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return { supabase, user }
}

function cleanName(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function readExerciseIds(formData: FormData) {
  const seen = new Set<string>()

  return String(formData.get("exerciseIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => {
      if (!UUID_PATTERN.test(id) || seen.has(id)) return false
      seen.add(id)
      return true
    })
}

export async function createExercise(input: {
  nombre: string
  grupoMuscular: string
}): Promise<{ exercise: ExerciseOption } | { error: string }> {
  const nombre = cleanName(input.nombre)
  const grupoMuscular = input.grupoMuscular

  if (nombre.length === 0 || nombre.length > 80) {
    return { error: "Escribe el nombre del ejercicio." }
  }

  if (!isMuscleGroup(grupoMuscular)) {
    return { error: "Elige un grupo muscular." }
  }

  const { supabase, user } = await requireUser()
  const { data, error } = await supabase
    .from("exercises")
    .insert({
      user_id: user.id,
      nombre,
      grupo_muscular: grupoMuscular,
    })
    .select("id, nombre, grupo_muscular")
    .single()

  if (error?.code === "23505") {
    const { data: catalog } = await supabase
      .from("exercises")
      .select("id, nombre, grupo_muscular")

    const existing = catalog?.find(
      (exercise) => exercise.nombre.toLocaleLowerCase("es") === nombre.toLocaleLowerCase("es"),
    )

    if (existing && isMuscleGroup(existing.grupo_muscular)) {
      return {
        exercise: {
          id: existing.id,
          nombre: existing.nombre,
          grupo_muscular: existing.grupo_muscular,
        },
      }
    }

    return { error: "Ese ejercicio ya está en tu catálogo." }
  }

  if (error || !data || !isMuscleGroup(data.grupo_muscular)) {
    return { error: "No se pudo guardar el ejercicio." }
  }

  return {
    exercise: {
      id: data.id,
      nombre: data.nombre,
      grupo_muscular: data.grupo_muscular,
    },
  }
}

export async function saveRoutine(
  _previous: RoutineFormState,
  formData: FormData,
): Promise<RoutineFormState> {
  const nombre = cleanName(String(formData.get("nombre") ?? ""))
  const routineId = String(formData.get("routineId") ?? "").trim()
  const exerciseIds = readExerciseIds(formData)

  if (nombre.length === 0 || nombre.length > 80) {
    return { error: "Escribe el nombre de la rutina." }
  }

  if (exerciseIds.length === 0) {
    return { error: "Agrega al menos un ejercicio." }
  }

  if (routineId && !UUID_PATTERN.test(routineId)) {
    return { error: "No encontramos esa rutina." }
  }

  const { supabase, user } = await requireUser()

  let id = routineId

  if (!id) {
    const { data, error } = await supabase
      .from("routines")
      .insert({ user_id: user.id, nombre })
      .select("id")
      .single()

    if (error || !data) {
      return { error: "No se pudo crear la rutina." }
    }

    id = data.id
  } else {
    const { data, error } = await supabase
      .from("routines")
      .update({ nombre })
      .eq("id", id)
      .select("id")
      .maybeSingle()

    if (error || !data) {
      return { error: "No encontramos esa rutina." }
    }
  }

  const { error: deleteError } = await supabase
    .from("routine_exercises")
    .delete()
    .eq("routine_id", id)

  if (deleteError) {
    return { error: "No se pudieron actualizar los ejercicios." }
  }

  const { error: insertError } = await supabase.from("routine_exercises").insert(
    exerciseIds.map((exerciseId, index) => ({
      routine_id: id,
      exercise_id: exerciseId,
      orden: index + 1,
    })),
  )

  if (insertError) {
    if (!routineId) {
      await supabase.from("routines").delete().eq("id", id)
    }
    return { error: "No se pudieron guardar los ejercicios de la rutina." }
  }

  revalidatePath("/routines")
  revalidatePath(`/routines/${id}`)
  revalidatePath("/workout")
  revalidateUserViews(user.id)
  return { redirectTo: "/routines" }
}
