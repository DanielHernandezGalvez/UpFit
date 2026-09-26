"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { FormMessage } from "@/features/auth/form-message"
import { formatKg } from "@/features/dashboard/stats"
import { addSet, type AddSetState } from "@/features/workouts/actions"

type LoggedSet = {
  numero_serie: number
  peso: number
  repeticiones: number
}

function formatAmount(value: number) {
  const rounded = Math.round(value * 100) / 100
  if (Number.isInteger(rounded)) return String(rounded)
  return rounded.toFixed(2).replace(/0$/, "")
}

function changeWeight(peso: number, delta: number) {
  const next = Math.round((peso + delta) * 100) / 100
  return Math.min(9999.99, Math.max(0, next))
}

export function ExerciseLogger({
  sessionId,
  exerciseId,
  nombre,
  grupo,
  sets,
  suggestedPeso,
  suggestedReps,
}: {
  sessionId: string
  exerciseId: string
  nombre: string
  grupo: string | null
  sets: LoggedSet[]
  suggestedPeso: number
  suggestedReps: number
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<AddSetState, FormData>(
    addSet,
    null,
  )
  const lastSet = sets[sets.length - 1]
  const [peso, setPeso] = useState(lastSet ? lastSet.peso : suggestedPeso)
  const [reps, setReps] = useState(lastSet ? lastSet.repeticiones : suggestedReps)
  const refreshedId = useRef<string | null>(null)

  useEffect(() => {
    if (!lastSet) return
    setPeso(lastSet.peso)
    setReps(lastSet.repeticiones)
  }, [lastSet])

  useEffect(() => {
    if (!state?.savedId || refreshedId.current === state.savedId) return
    refreshedId.current = state.savedId
    router.refresh()
  }, [router, state])

  const nextSet = (lastSet?.numero_serie ?? 0) + 1

  return (
    <section className="flex flex-col gap-3 rounded-3xl border bg-card p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">{nombre}</h2>
        {grupo ? <p className="text-sm text-muted-foreground">{grupo}</p> : null}
      </div>

      {sets.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {sets.map((set) => (
            <li
              key={set.numero_serie}
              className="flex items-center justify-between text-base"
            >
              <span className="text-muted-foreground">Serie {set.numero_serie}</span>
              <span className="font-semibold">
                {formatKg(set.peso)} × {set.repeticiones}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-base text-muted-foreground">Sin series todavía.</p>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <FormMessage error={state?.error} />
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="exerciseId" value={exerciseId} />
        <input type="hidden" name="peso" value={peso} />
        <input type="hidden" name="repeticiones" value={reps} />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Peso (kg)</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon-lg"
                variant="outline"
                aria-label="Bajar peso"
                onClick={() => setPeso((current) => changeWeight(current, -1))}
              >
                −
              </Button>
              <span className="flex-1 text-center text-2xl font-semibold tabular-nums">
                {formatAmount(peso)}
              </span>
              <Button
                type="button"
                size="icon-lg"
                variant="outline"
                aria-label="Subir peso"
                onClick={() => setPeso((current) => changeWeight(current, 1))}
              >
                +
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Reps</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon-lg"
                variant="outline"
                aria-label="Bajar repeticiones"
                onClick={() => setReps((current) => Math.max(1, current - 1))}
              >
                −
              </Button>
              <span className="flex-1 text-center text-2xl font-semibold tabular-nums">
                {reps}
              </span>
              <Button
                type="button"
                size="icon-lg"
                variant="outline"
                aria-label="Subir repeticiones"
                onClick={() => setReps((current) => Math.min(999, current + 1))}
              >
                +
              </Button>
            </div>
          </div>
        </div>

        <Button type="submit" size="touch" className="w-full" disabled={pending}>
          {pending ? "Guardando..." : `Agregar serie ${nextSet}`}
        </Button>
      </form>
    </section>
  )
}
