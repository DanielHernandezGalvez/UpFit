import assert from "node:assert/strict"
import test from "node:test"

import { parseMeasurement } from "./parse.ts"

const empty = {
  fecha: "2026-09-27",
  peso: "",
  cintura: "",
  pecho: "",
  cadera: "",
  brazo: "",
  muslo: "",
}

test("accepts a record with only weight", () => {
  const result = parseMeasurement({ ...empty, peso: "70,5" })
  assert.equal("values" in result, true)
  if ("values" in result) assert.equal(result.values.peso, 70.5)
})

test("requires at least one measurement", () => {
  const result = parseMeasurement(empty)
  assert.deepEqual(result, { error: "Escribe al menos el peso o una medida." })
})

test("rejects zero and a missing date", () => {
  assert.deepEqual(parseMeasurement({ ...empty, fecha: "", peso: "70" }), {
    error: "Elige la fecha de la medición.",
  })
  assert.deepEqual(parseMeasurement({ ...empty, cintura: "0" }), {
    error: "Las medidas tienen que ser números mayores que cero.",
  })
})
