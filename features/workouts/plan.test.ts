import assert from "node:assert/strict"
import test from "node:test"

import {
  clampSeries,
  elapsedMinutes,
  isCardioOption,
  parseExercisePlan,
  suggestionForSet,
} from "./plan.ts"

test("series guide stays between 1 and 20", () => {
  assert.equal(clampSeries(0), 1)
  assert.equal(clampSeries(4.2), 4)
  assert.equal(clampSeries(40), 20)
})

test("parses the exercise plan and ignores duplicates", () => {
  const id = "11111111-1111-4111-8111-111111111111"
  const other = "22222222-2222-4222-8222-222222222222"
  assert.deepEqual(parseExercisePlan(`${id}:4,${id}:9,${other}:0`), [
    { id, series: 4 },
    { id: other, series: 1 },
  ])
})

test("uses the matching set from last time, then the last one", () => {
  const previous = [
    { peso: 60, repeticiones: 8 },
    { peso: 62, repeticiones: 6 },
  ]
  assert.deepEqual(suggestionForSet(previous, 0), previous[0])
  assert.deepEqual(suggestionForSet(previous, 1), previous[1])
  assert.deepEqual(suggestionForSet(previous, 3), previous[1])
  assert.equal(suggestionForSet([], 0), null)
})

test("elapsed routine time stays between 1 and 300 minutes", () => {
  assert.equal(elapsedMinutes(0, 10 * 60000), 10)
  assert.equal(elapsedMinutes(0, 0), 1)
  assert.equal(elapsedMinutes(0, 400 * 60000), 300)
})

test("accepts the cardio options", () => {
  assert.equal(isCardioOption("Caminadora"), true)
  assert.equal(isCardioOption("Natación"), false)
})
