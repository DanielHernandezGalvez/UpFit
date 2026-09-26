import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { formatSessionDate } from "@/features/history/format"
import { embeddedCount } from "@/lib/revalidate-user"
import { createClient } from "@/lib/supabase/server"

type RoutineEmbed = { nombre: string } | { nombre: string }[] | null

function routineName(value: RoutineEmbed) {
  if (!value) return null
  if (Array.isArray(value)) return value[0]?.nombre ?? null
  return value.nombre
}

export default function HistoryPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 pt-8 pb-24 md:max-w-3xl md:pb-10">
      <header className="space-y-2">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Upfit
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Historial</h1>
      </header>
      <Suspense
        fallback={<div className="h-40 animate-pulse rounded-3xl bg-muted" aria-hidden="true" />}
      >
        <HistoryList />
      </Suspense>
    </main>
  )
}

async function HistoryList() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data } = await supabase
    .from("workout_sessions")
    .select("id, fecha, created_at, routines(nombre), session_sets(count)")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })

  const sessions = (data ?? []).filter(
    (session) => embeddedCount(session.session_sets) > 0,
  )

  return (
    <>

      {sessions.length === 0 ? (
        <p className="text-base leading-relaxed text-muted-foreground">
          Cuando termines un entrenamiento con alguna serie, va a aparecer aquí.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((session) => {
            const nombre = routineName(session.routines as RoutineEmbed)
            const count = embeddedCount(session.session_sets)
            const detail = count === 1 ? "1 serie" : `${count} series`

            return (
              <li key={session.id}>
                <Link
                  href={`/history/${session.id}`}
                  className="flex min-h-16 items-center justify-between gap-3 rounded-3xl border bg-card px-4 py-4 shadow-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-base font-medium">
                      {nombre ?? "Sin rutina"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatSessionDate(session.fecha)}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {detail}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
