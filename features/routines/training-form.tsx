"use client"

import { useActionState, useState } from "react"

import { Button } from "@/components/ui/button"
import { FormMessage } from "@/features/auth/form-message"
import { useAuthRedirect } from "@/features/auth/use-auth-redirect"
import { generateTrainingPlan } from "@/features/routines/generate-actions"
import {
  TRAINING_FOCUSES,
  TRAINING_GOALS,
  TRAINING_LEVELS,
  type TrainingFocus,
  type TrainingGoal,
  type TrainingLevel,
} from "@/features/routines/generate"
import type { RoutineFormState } from "@/features/routines/types"

function ChoiceGroup<T extends string>({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string
  name: string
  options: readonly T[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{label}</legend>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option}
            type="button"
            variant={value === option ? "default" : "outline"}
            onClick={() => onChange(option)}
          >
            {option}
          </Button>
        ))}
      </div>
    </fieldset>
  )
}

export function TrainingForm({
  initialGoal = "Hipertrofia",
  initialLevel = "Principiante",
  initialDays = 3,
  initialFocus = "Empuje y tirón",
}: {
  initialGoal?: TrainingGoal
  initialLevel?: TrainingLevel
  initialDays?: number
  initialFocus?: TrainingFocus
}) {
  const [state, formAction, pending] = useActionState<RoutineFormState, FormData>(
    generateTrainingPlan,
    null,
  )
  useAuthRedirect(state)
  const [objetivo, setObjetivo] = useState<TrainingGoal>(initialGoal)
  const [nivel, setNivel] = useState<TrainingLevel>(initialLevel)
  const [dias, setDias] = useState(initialDays)
  const [enfoque, setEnfoque] = useState<TrainingFocus>(initialFocus)

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FormMessage error={state?.error} />
      <ChoiceGroup
        label="Objetivo"
        name="objetivo"
        options={TRAINING_GOALS}
        value={objetivo}
        onChange={setObjetivo}
      />
      <ChoiceGroup
        label="Nivel"
        name="nivel"
        options={TRAINING_LEVELS}
        value={nivel}
        onChange={setNivel}
      />
      <ChoiceGroup
        label="Enfoque"
        name="enfoque"
        options={TRAINING_FOCUSES}
        value={enfoque}
        onChange={setEnfoque}
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Días por semana</legend>
        <input type="hidden" name="dias" value={dias} />
        <div className="flex flex-wrap gap-2">
          {[2, 3, 4, 5, 6].map((day) => (
            <Button
              key={day}
              type="button"
              variant={dias === day ? "default" : "outline"}
              onClick={() => setDias(day)}
            >
              {day}
            </Button>
          ))}
        </div>
      </fieldset>
      <Button type="submit" size="touch" className="w-full" disabled={pending}>
        {pending ? "Generando..." : "Generar rutinas"}
      </Button>
    </form>
  )
}
