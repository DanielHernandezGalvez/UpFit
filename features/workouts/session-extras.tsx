"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { finishWorkout, addCardio } from "@/features/workouts/actions"
import { CARDIO_OPTIONS, elapsedMinutes, type CardioOption } from "@/features/workouts/plan"

export function SessionExtras({
  sessionId,
  createdAt,
  cardio,
}: {
  sessionId: string
  createdAt: string
  cardio: { id: string; tipo: string; minutos: number }[]
}) {
  const [minutes, setMinutes] = useState(45)
  const [cardioType, setCardioType] = useState<CardioOption>("Caminadora")
  const [cardioMinutes, setCardioMinutes] = useState(10)

  useEffect(() => {
    setMinutes(elapsedMinutes(Date.parse(createdAt), Date.now()))
  }, [createdAt])

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-3xl border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Tiempo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Parte del tiempo desde que empezaste. Ajústalo si hace falta.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Button
            type="button"
            size="icon-lg"
            variant="outline"
            aria-label="Menos minutos"
            onClick={() => setMinutes((current) => Math.max(1, current - 1))}
          >
            −
          </Button>
          <span className="flex-1 text-center text-2xl font-semibold tabular-nums">
            {minutes} min
          </span>
          <Button
            type="button"
            size="icon-lg"
            variant="outline"
            aria-label="Más minutos"
            onClick={() => setMinutes((current) => Math.min(300, current + 1))}
          >
            +
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Cardio</h2>
        {cardio.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
            {cardio.map((item) => (
              <li key={item.id}>
                {item.tipo}: {item.minutos} min
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Opcional.</p>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {CARDIO_OPTIONS.map((option) => (
            <Button
              key={option}
              type="button"
              variant={cardioType === option ? "default" : "outline"}
              onClick={() => setCardioType(option)}
            >
              {option}
            </Button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button
            type="button"
            size="icon-lg"
            variant="outline"
            aria-label="Menos minutos de cardio"
            onClick={() => setCardioMinutes((current) => Math.max(1, current - 1))}
          >
            −
          </Button>
          <span className="flex-1 text-center text-xl font-semibold tabular-nums">
            {cardioMinutes} min
          </span>
          <Button
            type="button"
            size="icon-lg"
            variant="outline"
            aria-label="Más minutos de cardio"
            onClick={() => setCardioMinutes((current) => Math.min(300, current + 1))}
          >
            +
          </Button>
        </div>
        <form action={addCardio} className="mt-3">
          <input type="hidden" name="sessionId" value={sessionId} />
          <input type="hidden" name="tipo" value={cardioType} />
          <input type="hidden" name="minutos" value={cardioMinutes} />
          <Button type="submit" variant="secondary" size="touch" className="w-full">
            Agregar cardio
          </Button>
        </form>
      </section>

      <form action={finishWorkout}>
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="duracionMinutos" value={minutes} />
        <Button type="submit" variant="outline" size="touch" className="w-full">
          Finalizar sesión
        </Button>
      </form>
    </div>
  )
}
