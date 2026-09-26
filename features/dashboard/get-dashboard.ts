import { unstable_cache } from "next/cache"

import {
  countTrainingDays,
  currentWeek,
  currentYearRange,
  hasActiveStreak,
  lastSevenDayRange,
  topPersonalRecords,
  type PersonalRecord,
} from "@/features/dashboard/stats"
import { embeddedCount } from "@/lib/revalidate-user"
import { createClient } from "@/lib/supabase/server"
import { createUserClient } from "@/lib/supabase/user-client"

type ExerciseRow = {
  id: string
  nombre: string
  grupo_muscular: string | null
}

type SetRow = {
  exercise_id: string
  peso: number | string
}

async function loadDashboard(userId: string, accessToken: string) {
  const supabase = createUserClient(accessToken)
  const now = new Date()
  const week = lastSevenDayRange(now)
  const year = currentYearRange(now)
  const rangeStart = week.start < year.start ? week.start : year.start

  const [profileResult, sessionsResult, setsResult] = await Promise.all([
    supabase.from("profiles").select("nombre").eq("id", userId).maybeSingle(),
    supabase
      .from("workout_sessions")
      .select("fecha, session_sets(count)")
      .gte("fecha", rangeStart)
      .lte("fecha", year.end),
    supabase.from("session_sets").select("exercise_id, peso"),
  ])

  const trainedDates = (sessionsResult.data ?? [])
    .filter((session) => embeddedCount(session.session_sets) > 0)
    .map((session) => session.fecha)
  const trained = new Set(trainedDates)
  const weekDays = currentWeek(trained, now)

  const bestByExercise = new Map<string, number>()
  for (const set of (setsResult.data ?? []) as SetRow[]) {
    const peso = Number(set.peso)
    const current = bestByExercise.get(set.exercise_id)
    if (current === undefined || peso > current) {
      bestByExercise.set(set.exercise_id, peso)
    }
  }

  const topIds = [...bestByExercise.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id)

  const { data: exercises } = topIds.length
    ? await supabase
        .from("exercises")
        .select("id, nombre, grupo_muscular")
        .in("id", topIds)
    : { data: [] as ExerciseRow[] }

  const byId = new Map(
    ((exercises ?? []) as ExerciseRow[]).map((exercise) => [exercise.id, exercise]),
  )
  const records: PersonalRecord[] = topIds.flatMap((id) => {
    const exercise = byId.get(id)
    const peso = bestByExercise.get(id)
    if (!exercise || peso === undefined) return []
    return [
      {
        exerciseId: id,
        nombre: exercise.nombre,
        grupo: exercise.grupo_muscular,
        peso,
      },
    ]
  })

  return {
    nombre:
      profileResult.data?.nombre ??
      "Usuario",
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

export async function getDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) return null

  return unstable_cache(
    () => loadDashboard(user.id, session.access_token),
    ["dashboard", user.id],
    { revalidate: 60, tags: [`dashboard:${user.id}`] },
  )()
}
