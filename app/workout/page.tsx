import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { StartRoutineList } from "@/features/workouts/start-routine-list"
import { createClient } from "@/lib/supabase/server"

export default async function WorkoutPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: routines } = await supabase
    .from("routines")
    .select("id, nombre")
    .order("created_at", { ascending: true })

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8">
      <header className="space-y-2">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Upfit
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Iniciar rutina</h1>
      </header>

      {!routines?.length ? (
        <p className="text-base leading-relaxed text-muted-foreground">
          Todavía no tienes rutinas. Crea la primera para poder empezarla aquí.
        </p>
      ) : (
        <StartRoutineList routines={routines} />
      )}

      <div className="mt-auto flex flex-col gap-3">
        <Button
          nativeButton={false}
          render={<Link href={routines?.length ? "/routines" : "/routines/new"} />}
          size="touch"
          className="w-full"
        >
          {routines?.length ? "Mis rutinas" : "Crear rutina"}
        </Button>
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
    </main>
  )
}
