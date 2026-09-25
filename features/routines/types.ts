import type { MuscleGroup } from "@/features/routines/muscle-groups"

export type ExerciseOption = {
  id: string
  nombre: string
  grupo_muscular: MuscleGroup
}

export type RoutineFormState = {
  error?: string
  redirectTo?: string
} | null
