"use client"

import { useState } from "react"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { FormMessage } from "@/features/auth/form-message"
import { useAuthRedirect } from "@/features/auth/use-auth-redirect"
import { copyPublicRoutine, loadMorePublicRoutines } from "@/features/routines/catalog-actions"
import type { PublicRoutine } from "@/features/routines/catalog"
import type { RoutineFormState } from "@/features/routines/types"

function exerciseLine(routine: PublicRoutine) {
  if (routine.ejercicios.length === 0) return "Sin ejercicios"
  const visible = routine.ejercicios.slice(0, 6)
  const extra = routine.ejercicios.length - visible.length
  const line = visible.map((item) => `${item.nombre} · ${item.series}`).join(", ")
  return extra > 0 ? `${line} y ${extra} más` : line
}

function AddRoutineButton({ routineId }: { routineId: string }) {
  const [state, formAction, pending] = useActionState<RoutineFormState, FormData>(
    copyPublicRoutine,
    null,
  )
  useAuthRedirect(state)

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="routineId" value={routineId} />
      <FormMessage error={state?.error} />
      <Button type="submit" size="touch" className="w-full" disabled={pending}>
        {pending ? "Agregando..." : "Agregar"}
      </Button>
    </form>
  )
}

export function PublicRoutineList({
  initial,
  initialHasMore,
}: {
  initial: PublicRoutine[]
  initialHasMore: boolean
}) {
  const [routines, setRoutines] = useState(initial)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  async function loadMore() {
    setPending(true)
    setError(undefined)
    const page = await loadMorePublicRoutines(routines.length)
    setPending(false)

    if (page.unavailable) {
      setError("No se pudieron cargar más rutinas.")
      return
    }

    setRoutines((current) => [...current, ...page.routines])
    setHasMore(page.hasMore)
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {routines.map((routine) => (
          <li key={routine.id} className="rounded-3xl border bg-card p-4 shadow-sm">
            <h3 className="text-lg font-semibold">{routine.nombre}</h3>
            <p className="text-sm text-muted-foreground">{routine.autor}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {exerciseLine(routine)}
            </p>
            <AddRoutineButton routineId={routine.id} />
          </li>
        ))}
      </ul>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {hasMore ? (
        <Button
          type="button"
          variant="outline"
          size="touch"
          className="w-full"
          disabled={pending}
          onClick={() => void loadMore()}
        >
          {pending ? "Cargando..." : "Cargar más"}
        </Button>
      ) : null}
    </div>
  )
}
