export type MeasurementInput = {
  fecha: string
  peso: string
  cintura: string
  pecho: string
  cadera: string
  brazo: string
  muslo: string
}

export type MeasurementValues = {
  fecha: string
  peso: number | null
  cintura: number | null
  pecho: number | null
  cadera: number | null
  brazo: number | null
  muslo: number | null
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function readOptional(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const number = Number(trimmed.replace(",", "."))
  if (!Number.isFinite(number) || number <= 0) return Number.NaN
  return Math.round(number * 10) / 10
}

export function parseMeasurement(
  input: MeasurementInput,
): { values: MeasurementValues } | { error: string } {
  if (!DATE_PATTERN.test(input.fecha)) {
    return { error: "Elige la fecha de la medición." }
  }

  const fields = {
    peso: readOptional(input.peso),
    cintura: readOptional(input.cintura),
    pecho: readOptional(input.pecho),
    cadera: readOptional(input.cadera),
    brazo: readOptional(input.brazo),
    muslo: readOptional(input.muslo),
  }

  if (Object.values(fields).some((value) => Number.isNaN(value))) {
    return { error: "Las medidas tienen que ser números mayores que cero." }
  }

  if (Object.values(fields).every((value) => value === null)) {
    return { error: "Escribe al menos el peso o una medida." }
  }

  return { values: { fecha: input.fecha, ...fields } }
}
