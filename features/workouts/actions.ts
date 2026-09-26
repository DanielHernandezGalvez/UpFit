"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isoDate } from "@/features/dashboard/stats"
import { revalidateUserViews } from "@/lib/revalidate-user"
import { createClient } from "@/lib/supabase/server"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export type AddSetState = {
  error?: string
  savedId?: string
} | null

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

export async function startWorkout(formData: FormData) {
  const routineId = String(formData.get("routineId") ?? "")
  const rawDate = String(formData.get("fecha") ?? "")
  const fecha = DATE_PATTERN.test(rawDate) ? rawDate : isoDate(new Date())

  if (!UUID_PATTERN.test(routineId)) {
    redirect("/workout")
  }

  const { supabase, user } = await requireUser()
  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      routine_id: routineId,
      fecha,
    })
    .select("id")
    .single()

  if (error || !data) {
    redirect("/workout")
  }

  redirect(`/workout/${data.id}`)
}

export async function addSet(
  _previous: AddSetState,
  formData: FormData,
): Promise<AddSetState> {
  const sessionId = String(formData.get("sessionId") ?? "")
  const exerciseId = String(formData.get("exerciseId") ?? "")
  const peso = Math.round(Number(formData.get("peso")) * 100) / 100
  const repeticiones = Number(formData.get("repeticiones"))

  if (!UUID_PATTERN.test(sessionId) || !UUID_PATTERN.test(exerciseId)) {
    return { error: "No se pudo guardar la serie." }
  }

  if (!Number.isFinite(peso) || peso < 0 || peso > 9999.99) {
    return { error: "El peso tiene que estar entre 0 y 9999.99 kg." }
  }

  if (!Number.isInteger(repeticiones) || repeticiones < 1 || repeticiones > 999) {
    return { error: "Las repeticiones tienen que ser un número entero." }
  }

  const { supabase, user } = await requireUser()
  const { data: session } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("id", sessionId)
    .maybeSingle()

  if (!session) {
    return { error: "No encontramos la sesión." }
  }

  const { data: previousSets } = await supabase
    .from("session_sets")
    .select("numero_serie")
    .eq("session_id", sessionId)
    .eq("exercise_id", exerciseId)
    .order("numero_serie", { ascending: false })
    .limit(1)

  const numeroSerie = (previousSets?.[0]?.numero_serie ?? 0) + 1
  const { data, error } = await supabase
    .from("session_sets")
    .insert({
      session_id: sessionId,
      exercise_id: exerciseId,
      numero_serie: numeroSerie,
      peso,
      repeticiones,
    })
    .select("id")
    .single()

  if (error || !data) {
    return { error: "No se pudo guardar la serie." }
  }

  revalidatePath(`/workout/${sessionId}`)
  revalidatePath("/")
  revalidatePath("/history")
  revalidateUserViews(user.id)
  return { savedId: data.id }
}

export async function finishWorkout(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "")

  if (!UUID_PATTERN.test(sessionId)) {
    redirect("/workout")
  }

  const { supabase, user } = await requireUser()
  const { data: sets } = await supabase
    .from("session_sets")
    .select("id")
    .eq("session_id", sessionId)
    .limit(1)

  if (!sets?.length) {
    await supabase.from("workout_sessions").delete().eq("id", sessionId)
    revalidateUserViews(user.id)
    redirect("/")
  }

  revalidatePath("/")
  revalidatePath("/history")
  revalidateUserViews(user.id)
  redirect("/")
}
