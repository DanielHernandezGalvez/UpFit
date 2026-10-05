"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isoDate } from "@/features/dashboard/stats"
import { isCardioOption } from "@/features/workouts/plan"
import { revalidateUserViews } from "@/lib/revalidate-user"
import { getRequestAuth } from "@/lib/supabase/request-auth"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export type AddSetState = {
  error?: string
  savedId?: string
} | null

async function requireUser() {
  const { supabase, user } = await getRequestAuth()

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

  const { data: planned } = await supabase
    .from("routine_exercises")
    .select("exercise_id, orden, series_objetivo")
    .eq("routine_id", routineId)
    .order("orden")

  if (planned?.length) {
    await supabase.from("session_exercises").insert(
      planned.map((item) => ({
        session_id: data.id,
        exercise_id: item.exercise_id,
        orden: item.orden,
        series_objetivo: item.series_objetivo ?? 3,
      })),
    )
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

  const { data: cardio } = await supabase
    .from("session_cardio")
    .select("id")
    .eq("session_id", sessionId)
    .limit(1)

  if (!sets?.length && !cardio?.length) {
    await supabase.from("workout_sessions").delete().eq("id", sessionId)
    revalidateUserViews(user.id)
    redirect("/")
  }

  const duracion = Number(formData.get("duracionMinutos"))
  if (Number.isInteger(duracion) && duracion >= 1 && duracion <= 300) {
    await supabase
      .from("workout_sessions")
      .update({ duracion_minutos: duracion })
      .eq("id", sessionId)
  }

  revalidatePath("/")
  revalidatePath("/history")
  revalidateUserViews(user.id)
  redirect("/")
}

export async function swapExercise(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "")
  const orden = Number(formData.get("orden"))
  const exerciseId = String(formData.get("exerciseId") ?? "")

  if (!UUID_PATTERN.test(sessionId) || !UUID_PATTERN.test(exerciseId) || !Number.isInteger(orden)) {
    redirect(`/workout/${sessionId}`)
  }

  const { supabase } = await requireUser()
  const { data: current } = await supabase
    .from("session_exercises")
    .select("exercise_id")
    .eq("session_id", sessionId)
    .eq("orden", orden)
    .maybeSingle()

  if (!current || current.exercise_id === exerciseId) {
    redirect(`/workout/${sessionId}`)
  }

  const { data: taken } = await supabase
    .from("session_exercises")
    .select("orden")
    .eq("session_id", sessionId)
    .eq("exercise_id", exerciseId)
    .maybeSingle()

  if (taken) {
    redirect(`/workout/${sessionId}?aviso=repetido`)
  }

  await supabase
    .from("session_sets")
    .update({ exercise_id: exerciseId })
    .eq("session_id", sessionId)
    .eq("exercise_id", current.exercise_id)

  await supabase
    .from("session_exercises")
    .update({ exercise_id: exerciseId })
    .eq("session_id", sessionId)
    .eq("orden", orden)

  revalidatePath(`/workout/${sessionId}`)
  redirect(`/workout/${sessionId}`)
}

export async function addCardio(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "")
  const tipo = String(formData.get("tipo") ?? "")
  const minutos = Number(formData.get("minutos"))

  if (!UUID_PATTERN.test(sessionId) || !isCardioOption(tipo)) {
    redirect(`/workout/${sessionId}`)
  }

  if (!Number.isInteger(minutos) || minutos < 1 || minutos > 300) {
    redirect(`/workout/${sessionId}`)
  }

  const { supabase } = await requireUser()
  await supabase.from("session_cardio").insert({
    session_id: sessionId,
    tipo,
    minutos,
  })

  revalidatePath(`/workout/${sessionId}`)
  redirect(`/workout/${sessionId}`)
}
