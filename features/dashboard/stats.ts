export function isoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function lastSevenDayRange(now = new Date()) {
  const start = new Date(now)
  start.setDate(start.getDate() - 6)
  return { start: isoDate(start), end: isoDate(now) }
}

export function currentYearRange(now = new Date()) {
  const year = now.getFullYear()
  return {
    year,
    start: isoDate(new Date(year, 0, 1)),
    end: isoDate(now),
  }
}

export function countTrainingDays(fechas: string[]) {
  return new Set(fechas).size
}

export type PersonalRecord = {
  exerciseId: string
  nombre: string
  grupo: string | null
  peso: number
}

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"] as const

export type WeekDayStatus = "trained" | "missed" | "today" | "future"

export type WeekDay = {
  iso: string
  label: string
  status: WeekDayStatus
}

export function currentWeek(trained: Set<string>, now = new Date()): WeekDay[] {
  const weekday = now.getDay()
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  const today = isoDate(now)

  return WEEKDAY_LABELS.map((label, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    const iso = isoDate(date)
    let status: WeekDayStatus = "missed"
    if (iso > today) status = "future"
    else if (trained.has(iso)) status = "trained"
    else if (iso === today) status = "today"

    return { iso, label, status }
  })
}

export function hasActiveStreak(trained: Set<string>, now = new Date()) {
  const today = isoDate(now)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  return trained.has(today) || trained.has(isoDate(yesterday))
}

export function topPersonalRecords(
  sets: PersonalRecord[],
  limit = 5,
): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>()

  for (const set of sets) {
    const current = best.get(set.exerciseId)
    if (!current || set.peso > current.peso) {
      best.set(set.exerciseId, set)
    }
  }

  return [...best.values()]
    .sort(
      (a, b) => b.peso - a.peso || a.nombre.localeCompare(b.nombre, "es"),
    )
    .slice(0, limit)
}

export function formatKg(peso: number) {
  const value = Number(peso)
  const text = Number.isInteger(value)
    ? String(value)
    : value.toLocaleString("es-MX", { maximumFractionDigits: 2 })
  return `${text} kg`
}
