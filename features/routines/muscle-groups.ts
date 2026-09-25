export const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Hombro",
  "Tríceps",
  "Bíceps",
  "Pierna",
] as const

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]

export function isMuscleGroup(value: string): value is MuscleGroup {
  return MUSCLE_GROUPS.some((group) => group === value)
}
