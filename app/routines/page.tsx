import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export default async function RoutinesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: routines } = await supabase
    .from("routines")
    .select("id, nombre, routine_exercises(id)")
    .order("created_at", { ascending: true })

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 pt-8 pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:max-w-3xl md:pb-10">
      <header className="space-y-2">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Upfit
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Rutinas</h1>
      </header>

      {!routines?.length ? (
        <p className="text-base leading-relaxed text-muted-foreground">
          Crea la primera con un nombre y los ejercicios que vas a hacer.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {routines.map((routine) => {
            const count = routine.routine_exercises?.length ?? 0
            const detail =
              count === 1 ? "1 ejercicio" : `${count} ejercicios`

            return (
              <li key={routine.id}>
                <Link
                  href={`/routines/${routine.id}`}
                  className="flex min-h-16 items-center justify-between gap-3 rounded-3xl border bg-card px-4 py-4 shadow-sm"
                >
                  <span className="truncate text-base font-medium">
                    {routine.nombre}
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

      <Button
        nativeButton={false}
        render={<Link href="/routines/new" />}
        size="touch"
        className="mt-2 w-full"
      >
        Crear rutina
      </Button>
    </main>
  )
}
