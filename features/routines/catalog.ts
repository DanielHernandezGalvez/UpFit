export const PUBLIC_PAGE_SIZE = 5

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type PublicExercise = {
  nombre: string
  series: number
}

export type PublicRoutine = {
  id: string
  nombre: string
  autor: string
  ejercicios: PublicExercise[]
}

export function publicPageOffset(value: number) {
  if (!Number.isInteger(value) || value < 0) return 0
  return value
}

export function takePublicPage<T>(rows: T[], size = PUBLIC_PAGE_SIZE) {
  const safeSize = size < 1 ? PUBLIC_PAGE_SIZE : size
  return {
    items: rows.slice(0, safeSize),
    hasMore: rows.length > safeSize,
  }
}

function guideSeries(value: number) {
  if (!Number.isFinite(value)) return 3
  return Math.min(20, Math.max(1, Math.round(value)))
}

function readExercises(value: unknown): PublicExercise[] {
  const source = typeof value === "string" ? parseJson(value) : value
  if (!Array.isArray(source)) return []

  return source.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const nombre = "nombre" in item ? String(item.nombre ?? "").trim() : ""
    if (!nombre) return []
    const series = "series" in item ? Number(item.series) : 3
    return [{ nombre, series: guideSeries(series) }]
  })
}

function parseJson(value: string) {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}

export function parsePublicRoutines(rows: unknown): PublicRoutine[] {
  if (!Array.isArray(rows)) return []

  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return []
    const id = "routine_id" in row ? String(row.routine_id ?? "") : ""
    const nombre = "nombre" in row ? String(row.nombre ?? "").trim() : ""
    const autor = "autor" in row ? String(row.autor ?? "").trim() : ""
    if (!UUID_PATTERN.test(id) || !nombre) return []
    return [
      {
        id,
        nombre,
        autor: autor || "Usuario",
        ejercicios: readExercises("ejercicios" in row ? row.ejercicios : []),
      },
    ]
  })
}
