"use client"

import { useActionState, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormMessage } from "@/features/auth/form-message"
import { useAuthRedirect } from "@/features/auth/use-auth-redirect"
import { createExercise, saveRoutine } from "@/features/routines/actions"
import { MUSCLE_GROUPS, type MuscleGroup } from "@/features/routines/muscle-groups"
import type { ExerciseOption, RoutineFormState } from "@/features/routines/types"
import { clampSeries } from "@/features/workouts/plan"

export function RoutineForm({
  routineId,
  initialName = "",
  initialPlan = [],
  exercises: initialExercises,
}: {
  routineId?: string
  initialName?: string
  initialPlan?: { id: string; series: number }[]
  exercises: ExerciseOption[]
}) {
  const [state, formAction, pending] = useActionState<RoutineFormState, FormData>(
    saveRoutine,
    null,
  )
  useAuthRedirect(state)
  const [nombre, setNombre] = useState(initialName)
  const [exercises, setExercises] = useState(initialExercises)
  const [selected, setSelected] = useState(initialPlan)
  const [query, setQuery] = useState("")
  const [newName, setNewName] = useState("")
  const [grupo, setGrupo] = useState<MuscleGroup>("Pecho")
  const [adding, setAdding] = useState(false)
  const [localError, setLocalError] = useState<string>()

  const selectedExercises = selected.flatMap((item) => {
    const exercise = exercises.find((entry) => entry.id === item.id)
    return exercise ? [{ ...exercise, series: item.series }] : []
  })

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("es")
    return exercises
      .filter((exercise) =>
        term ? exercise.nombre.toLocaleLowerCase("es").includes(term) : true,
      )
      .sort(
        (a, b) =>
          a.grupo_muscular.localeCompare(b.grupo_muscular, "es") ||
          a.nombre.localeCompare(b.nombre, "es"),
      )
  }, [exercises, query])

  function toggleExercise(id: string) {
    setSelected((current) =>
      current.some((item) => item.id === id)
        ? current.filter((item) => item.id !== id)
        : [...current, { id, series: 3 }],
    )
  }

  function changeSeries(id: string, delta: number) {
    setSelected((current) =>
      current.map((item) =>
        item.id === id ? { ...item, series: clampSeries(item.series + delta) } : item,
      ),
    )
  }

  async function addExercise() {
    setLocalError(undefined)
    setAdding(true)
    const result = await createExercise({
      nombre: newName,
      grupoMuscular: grupo,
    })
    setAdding(false)

    if ("error" in result) {
      setLocalError(result.error)
      return
    }

    setExercises((current) =>
      current.some((exercise) => exercise.id === result.exercise.id)
        ? current
        : [...current, result.exercise],
    )
    setSelected((current) =>
      current.some((item) => item.id === result.exercise.id)
        ? current
        : [...current, { id: result.exercise.id, series: 3 }],
    )
    setNewName("")
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FormMessage
        error={
          localError ??
          (state?.error === "Agrega al menos un ejercicio." &&
          selected.length > 0
            ? undefined
            : state?.error)
        }
      />
      {routineId ? <input type="hidden" name="routineId" value={routineId} /> : null}
      <input
        type="hidden"
        name="exercisePlan"
        value={selected.map((item) => `${item.id}:${item.series}`).join(",")}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          name="nombre"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Push, Pull, Legs..."
          maxLength={80}
          required
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">En esta rutina</h2>
        {selectedExercises.length === 0 ? (
          <p className="text-base text-muted-foreground">
            Todavía no agregas ejercicios.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {selectedExercises.map((exercise) => (
              <li
                key={exercise.id}
                className="flex flex-col gap-3 rounded-xl border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium">{exercise.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.grupo_muscular}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => toggleExercise(exercise.id)}
                  >
                    Quitar
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Series guía</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      aria-label={`Menos series de ${exercise.nombre}`}
                      onClick={() => changeSeries(exercise.id, -1)}
                    >
                      −
                    </Button>
                    <span className="w-6 text-center font-semibold tabular-nums">
                      {exercise.series}
                    </span>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      aria-label={`Más series de ${exercise.nombre}`}
                      onClick={() => changeSeries(exercise.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ejercicio nuevo</h2>
        <div className="flex flex-col gap-2">
          <Label htmlFor="nuevo-ejercicio">Nombre</Label>
          <Input
            id="nuevo-ejercicio"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                void addExercise()
              }
            }}
            maxLength={80}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {MUSCLE_GROUPS.map((group) => (
            <Button
              key={group}
              type="button"
              variant={grupo === group ? "default" : "outline"}
              className="w-full"
              onClick={() => setGrupo(group)}
            >
              {group}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="touch"
          className="w-full"
          disabled={adding}
          onClick={() => void addExercise()}
        >
          {adding ? "Agregando..." : "Agregar ejercicio"}
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Tu catálogo</h2>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar ejercicio"
          aria-label="Buscar ejercicio"
        />
        {exercises.length === 0 ? (
          <p className="text-base text-muted-foreground">
            Tu catálogo está vacío. Crea el primer ejercicio arriba.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-base text-muted-foreground">
            No hay ejercicios con ese nombre. Créalo arriba.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((exercise) => {
              const added = selected.some((item) => item.id === exercise.id)
              return (
                <li key={exercise.id}>
                  <button
                    type="button"
                    onClick={() => toggleExercise(exercise.id)}
                    className={`flex h-14 w-full items-center justify-between gap-3 rounded-xl border px-4 text-left ${
                      added ? "border-primary bg-accent" : "border-border bg-background"
                    }`}
                  >
                    <span className="truncate text-base font-medium">
                      {exercise.nombre}
                    </span>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {added ? "Agregado" : exercise.grupo_muscular}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-4">
        <Button type="submit" size="touch" className="w-full" disabled={pending}>
          {pending ? "Guardando..." : "Guardar rutina"}
        </Button>
      </div>
    </form>
  )
}
