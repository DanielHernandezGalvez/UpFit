"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { isoDate } from "@/features/dashboard/stats"
import { startWorkout } from "@/features/workouts/actions"

export function StartRoutineList({
  routines,
}: {
  routines: { id: string; nombre: string }[]
}) {
  const [fecha, setFecha] = useState("")

  useEffect(() => {
    setFecha(isoDate(new Date()))
  }, [])

  return (
    <ul className="flex flex-col gap-3">
      {routines.map((routine) => (
        <li key={routine.id}>
          <form action={startWorkout}>
            <input type="hidden" name="routineId" value={routine.id} />
            <input type="hidden" name="fecha" value={fecha} />
            <Button
              type="submit"
              size="touch"
              className="w-full"
              disabled={!fecha}
            >
              {routine.nombre}
            </Button>
          </form>
        </li>
      ))}
    </ul>
  )
}
