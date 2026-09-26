import Link from "next/link"
import { redirect } from "next/navigation"

import { formatKg } from "@/features/dashboard/stats"
import { formatSessionDate } from "@/features/history/format"
import { createClient } from "@/lib/supabase/server"

type RoutineEmbed = { nombre: string } | { nombre: string }[] | null
type ExerciseEmbed = { nombre: string } | { nombre: string }[] | null

function oneName(value: { nombre: string } | { nombre: string }[] | null) {
  if (!value) return null
  if (Array.isArray(value)) return value[0]?.nombre ?? null
  return value.nombre
}

export default async function HistoryDetailPage({
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

  const { data: session } = await supabase
    .from("workout_sessions")
    .select("id, fecha, routines(nombre)")
    .eq("id", id)
    .maybeSingle()

  if (!session) {
    redirect("/history")
  }

  const { data: setRows } = await supabase
    .from("session_sets")
    .select("exercise_id, numero_serie, peso, repeticiones, created_at, exercises(nombre)")
    .eq("session_id", id)
    .order("created_at")

  const groups: {
    exerciseId: string
    nombre: string
    sets: { numero_serie: number; peso: number; repeticiones: number }[]
  }[] = []

  for (const row of setRows ?? []) {
    let group = groups.find((item) => item.exerciseId === row.exercise_id)
    if (!group) {
      group = {
        exerciseId: row.exercise_id,
        nombre: oneName(row.exercises as ExerciseEmbed) ?? "Ejercicio",
        sets: [],
      }
      groups.push(group)
    }
    group.sets.push({
      numero_serie: row.numero_serie,
      peso: Number(row.peso),
      repeticiones: row.repeticiones,
    })
  }

  for (const group of groups) {
    group.sets.sort((a, b) => a.numero_serie - b.numero_serie)
  }

  const routine = oneName(session.routines as RoutineEmbed)

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pt-8 pb-24 md:max-w-3xl md:pb-10">
      <header className="space-y-1">
        <Link
          href="/history"
          className="text-base font-medium text-foreground underline underline-offset-4"
        >
          Historial
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          {routine ?? "Sin rutina"}
        </h1>
        <p className="text-base text-muted-foreground">
          {formatSessionDate(session.fecha)}
        </p>
      </header>

      {groups.length === 0 ? (
        <p className="text-base text-muted-foreground">Esta sesión no tiene series.</p>
      ) : (
        groups.map((group) => (
          <section key={group.exerciseId} className="rounded-3xl border bg-card p-4 shadow-sm">
            <h2 className="text-lg font-semibold">{group.nombre}</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {group.sets.map((set) => (
                <li
                  key={set.numero_serie}
                  className="flex items-center justify-between text-base"
                >
                  <span className="text-muted-foreground">
                    Serie {set.numero_serie}
                  </span>
                  <span className="font-semibold">
                    {formatKg(set.peso)} × {set.repeticiones}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  )
}
