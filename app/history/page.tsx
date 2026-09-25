import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { formatSessionDate } from "@/features/history/format"
import { createClient } from "@/lib/supabase/server"

type RoutineEmbed = { nombre: string } | { nombre: string }[] | null

function routineName(value: RoutineEmbed) {
  if (!value) return null
  if (Array.isArray(value)) return value[0]?.nombre ?? null
  return value.nombre
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data } = await supabase
    .from("workout_sessions")
    .select("id, fecha, created_at, routines(nombre), session_sets(id)")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })

  const sessions = (data ?? []).filter(
    (session) => (session.session_sets?.length ?? 0) > 0,
  )

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 pt-8 pb-28">
      <header className="space-y-2">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Upfit
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Historial</h1>
      </header>

      {sessions.length === 0 ? (
        <p className="text-base leading-relaxed text-muted-foreground">
          Cuando termines un entrenamiento con alguna serie, va a aparecer aquí.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((session) => {
            const nombre = routineName(session.routines as RoutineEmbed)
            const count = session.session_sets?.length ?? 0
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

      <div className="fixed inset-x-0 bottom-0 border-t bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-md">
          <Button
            nativeButton={false}
            render={<Link href="/" />}
            variant="outline"
            size="touch"
            className="w-full"
          >
            Volver
          </Button>
        </div>
      </div>
    </main>
  )
}
