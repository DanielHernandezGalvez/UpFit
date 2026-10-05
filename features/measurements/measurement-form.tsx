"use client"

import { useActionState, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormMessage } from "@/features/auth/form-message"
import { saveMeasurement } from "@/features/measurements/actions"
import type { RoutineFormState } from "@/features/routines/types"

const fields = [
  { name: "peso", label: "Peso (kg)" },
  { name: "cintura", label: "Cintura (cm)" },
  { name: "pecho", label: "Pecho (cm)" },
  { name: "cadera", label: "Cadera (cm)" },
  { name: "brazo", label: "Brazo (cm)" },
  { name: "muslo", label: "Muslo (cm)" },
] as const

export function MeasurementForm() {
  const [state, formAction, pending] = useActionState<RoutineFormState, FormData>(
    saveMeasurement,
    null,
  )
  const [fecha, setFecha] = useState("")

  useEffect(() => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    setFecha(`${now.getFullYear()}-${month}-${day}`)
  }, [])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage error={state?.error} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="fecha">Fecha</Label>
        <Input
          id="fecha"
          name="fecha"
          type="date"
          value={fecha}
          onChange={(event) => setFecha(event.target.value)}
          required
        />
      </div>
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input id={field.name} name={field.name} inputMode="decimal" placeholder="Opcional" />
        </div>
      ))}
      <Button type="submit" size="touch" className="w-full" disabled={pending}>
        {pending ? "Guardando..." : "Guardar medición"}
      </Button>
    </form>
  )
}
