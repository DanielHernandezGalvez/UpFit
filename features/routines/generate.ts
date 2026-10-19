type MuscleGroup = "Pecho" | "Espalda" | "Hombro" | "Tríceps" | "Bíceps" | "Pierna"

export const TRAINING_GOALS = ["Fuerza", "Hipertrofia", "Resistencia"] as const
export const TRAINING_LEVELS = ["Principiante", "Intermedio", "Avanzado"] as const
export const TRAINING_FOCUSES = ["Cuerpo completo", "Empuje y tirón", "Torso y pierna"] as const

export type TrainingGoal = (typeof TRAINING_GOALS)[number]
export type TrainingLevel = (typeof TRAINING_LEVELS)[number]
export type TrainingFocus = (typeof TRAINING_FOCUSES)[number]

export type TrainingInput = {
  objetivo: TrainingGoal
  nivel: TrainingLevel
  dias: number
  enfoque: TrainingFocus
}

export type KnownExercise = {
  nombre: string
  grupo: MuscleGroup
}

export type GeneratedExercise = KnownExercise & {
  series: number
}

export type GeneratedRoutine = {
  nombre: string
  ejercicios: GeneratedExercise[]
}

export const STARTER_EXERCISES: KnownExercise[] = [
  { nombre: "Press banca", grupo: "Pecho" },
  { nombre: "Fondos", grupo: "Pecho" },
  { nombre: "Remo", grupo: "Espalda" },
  { nombre: "Jalon al pecho", grupo: "Espalda" },
  { nombre: "Press militar", grupo: "Hombro" },
  { nombre: "Elevaciones laterales", grupo: "Hombro" },
  { nombre: "Extension de triceps", grupo: "Tríceps" },
  { nombre: "Curl de biceps", grupo: "Bíceps" },
  { nombre: "Sentadilla", grupo: "Pierna" },
  { nombre: "Peso muerto", grupo: "Pierna" },
  { nombre: "Prensa", grupo: "Pierna" },
]

const SPLITS: Record<TrainingFocus, { nombre: string; groups: MuscleGroup[] }[]> = {
  "Cuerpo completo": [
    { nombre: "Cuerpo completo", groups: ["Pecho", "Espalda", "Pierna", "Hombro"] },
  ],
  "Empuje y tirón": [
    { nombre: "Empuje", groups: ["Pecho", "Hombro", "Tríceps"] },
    { nombre: "Tirón", groups: ["Espalda", "Bíceps"] },
    { nombre: "Pierna", groups: ["Pierna"] },
  ],
  "Torso y pierna": [
    { nombre: "Torso", groups: ["Pecho", "Espalda", "Hombro", "Tríceps", "Bíceps"] },
    { nombre: "Pierna", groups: ["Pierna"] },
  ],
}

export function isTrainingGoal(value: string): value is TrainingGoal {
  return TRAINING_GOALS.some((item) => item === value)
}

export function isTrainingLevel(value: string): value is TrainingLevel {
  return TRAINING_LEVELS.some((item) => item === value)
}

export function isTrainingFocus(value: string): value is TrainingFocus {
  return TRAINING_FOCUSES.some((item) => item === value)
}

export function clampTrainingDays(value: number) {
  if (!Number.isInteger(value)) return 3
  return Math.min(6, Math.max(2, value))
}

function seriesFor(objetivo: TrainingGoal) {
  if (objetivo === "Fuerza") return 5
  if (objetivo === "Resistencia") return 3
  return 4
}

function exercisesFor(nivel: TrainingLevel) {
  if (nivel === "Principiante") return 4
  if (nivel === "Avanzado") return 6
  return 5
}

function dayName(base: string, index: number, total: number) {
  if (total <= 1) return base
  const letter = "ABCDE"[index]
  return letter ? `${base} ${letter}` : `${base} ${index + 1}`
}

function poolWithStarters(catalog: KnownExercise[]) {
  const names = new Set(catalog.map((item) => item.nombre.toLocaleLowerCase("es")))
  return [
    ...catalog,
    ...STARTER_EXERCISES.filter((item) => !names.has(item.nombre.toLocaleLowerCase("es"))),
  ]
}

function pickExercises(
  groups: MuscleGroup[],
  count: number,
  pool: KnownExercise[],
  offset: number,
) {
  const byGroup = new Map<MuscleGroup, KnownExercise[]>()
  for (const item of pool) {
    const list = byGroup.get(item.grupo) ?? []
    list.push(item)
    byGroup.set(item.grupo, list)
  }

  const chosen: KnownExercise[] = []
  const used = new Set<string>()
  let step = 0

  while (chosen.length < count && step < 48) {
    const group = groups[step % groups.length]
    const list = byGroup.get(group) ?? []
    if (list.length > 0) {
      const exercise = list[(offset + Math.floor(step / groups.length)) % list.length]
      const key = exercise.nombre.toLocaleLowerCase("es")
      if (!used.has(key)) {
        used.add(key)
        chosen.push(exercise)
      }
    }
    step += 1
  }

  return chosen
}

export function generateRoutines(
  input: TrainingInput,
  catalog: KnownExercise[],
): GeneratedRoutine[] {
  const dias = clampTrainingDays(input.dias)
  const pattern = SPLITS[input.enfoque]
  const series = seriesFor(input.objetivo)
  const count = exercisesFor(input.nivel)
  const pool = poolWithStarters(catalog)
  const slots = Array.from({ length: dias }, (_, day) => pattern[day % pattern.length])
  const totals = new Map<string, number>()
  for (const slot of slots) totals.set(slot.nombre, (totals.get(slot.nombre) ?? 0) + 1)

  const seen = new Map<string, number>()
  return slots.map((slot) => {
    const index = seen.get(slot.nombre) ?? 0
    seen.set(slot.nombre, index + 1)
    return {
      nombre: dayName(slot.nombre, index, totals.get(slot.nombre) ?? 1),
      ejercicios: pickExercises(slot.groups, count, pool, index).map((item) => ({
        ...item,
        series,
      })),
    }
  })
}
