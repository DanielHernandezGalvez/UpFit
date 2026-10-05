const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type PlannedExercise = {
  id: string
  series: number
}

export function clampSeries(value: number) {
  if (!Number.isFinite(value)) return 3
  return Math.min(20, Math.max(1, Math.round(value)))
}

export function parseExercisePlan(value: string): PlannedExercise[] {
  const seen = new Set<string>()
  const plan: PlannedExercise[] = []

  for (const part of value.split(",")) {
    const [rawId, rawSeries] = part.split(":")
    const id = rawId?.trim() ?? ""
    if (!UUID_PATTERN.test(id) || seen.has(id)) continue
    seen.add(id)
    plan.push({ id, series: clampSeries(Number(rawSeries)) })
  }

  return plan
}

export function suggestionForSet(
  previous: { peso: number; repeticiones: number }[],
  loggedCount: number,
) {
  if (previous.length === 0) return null
  return previous[loggedCount] ?? previous[previous.length - 1]
}

export function elapsedMinutes(createdAtMs: number, nowMs: number) {
  const minutes = Math.round((nowMs - createdAtMs) / 60000)
  if (!Number.isFinite(minutes) || minutes < 1) return 1
  return Math.min(300, minutes)
}

export const CARDIO_OPTIONS = [
  "Caminadora",
  "Bicicleta",
  "Elíptica",
  "Remo",
  "Cuerda",
  "Otro",
] as const

export type CardioOption = (typeof CARDIO_OPTIONS)[number]

export function isCardioOption(value: string): value is CardioOption {
  return CARDIO_OPTIONS.some((option) => option === value)
}
