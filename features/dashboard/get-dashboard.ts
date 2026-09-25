import { createClient } from "@/lib/supabase/server"

import {
  countTrainingDays,
  currentWeek,
  currentYearRange,
  hasActiveStreak,
  lastSevenDayRange,
  topPersonalRecords,
  type PersonalRecord,
} from "@/features/dashboard/stats"

type ExerciseEmbed =
  | { nombre: string; grupo_muscular?: string | null }
  | { nombre: string; grupo_muscular?: string | null }[]
  | null

type SetRow = {
  peso: number | string
  exercise_id: string
  exercises: ExerciseEmbed
}

function exerciseInfo(exercise: ExerciseEmbed) {
  const row = !exercise ? null : Array.isArray(exercise) ? exercise[0] : exercise
  return {
    nombre: row?.nombre ?? "Ejercicio",
    grupo: row?.grupo_muscular ?? null,
  }
}

export async function getDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre")
    .eq("id", user.id)
    .maybeSingle()

  const now = new Date()
  const week = lastSevenDayRange(now)
  const year = currentYearRange(now)
  const rangeStart = week.start < year.start ? week.start : year.start
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("fecha, session_sets(id)")
    .gte("fecha", rangeStart)
    .lte("fecha", year.end)

  const { data: sets } = await supabase
    .from("session_sets")
    .select("peso, exercise_id, exercises(nombre, grupo_muscular)")

  const trainedDates = (sessions ?? [])
    .filter((session) => (session.session_sets?.length ?? 0) > 0)
    .map((session) => session.fecha)
  const trained = new Set(trainedDates)
  const weekDays = currentWeek(trained, now)

  const records: PersonalRecord[] = ((sets ?? []) as SetRow[]).map((set) => {
    const info = exerciseInfo(set.exercises)
    return {
      exerciseId: set.exercise_id,
      nombre: info.nombre,
      grupo: info.grupo,
      peso: Number(set.peso),
    }
  })

  return {
    nombre: profile?.nombre ?? user.email?.split("@")[0] ?? "Usuario",
    trainingDays: weekDays.filter((day) => day.status === "trained").length,
    trainingDaysThisYear: countTrainingDays(
      trainedDates.filter((fecha) => fecha >= year.start && fecha <= year.end),
    ),
    year: year.year,
    weekDays,
    streakActive: hasActiveStreak(trained, now),
    records: topPersonalRecords(records),
  }
}
