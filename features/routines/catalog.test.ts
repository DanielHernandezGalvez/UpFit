import assert from "node:assert/strict"
import test from "node:test"

import {
  parsePublicRoutines,
  publicPageOffset,
  takePublicPage,
} from "./catalog.ts"

test("a public page keeps five routines and reports another page", () => {
  const page = takePublicPage([1, 2, 3, 4, 5, 6])
  assert.deepEqual(page.items, [1, 2, 3, 4, 5])
  assert.equal(page.hasMore, true)
})

test("the last short page does not offer another load", () => {
  const page = takePublicPage([1, 2])
  assert.deepEqual(page.items, [1, 2])
  assert.equal(page.hasMore, false)
})

test("page offset stays at zero for invalid values", () => {
  assert.equal(publicPageOffset(10), 10)
  assert.equal(publicPageOffset(-4), 0)
  assert.equal(publicPageOffset(1.5), 0)
})

test("parses a public routine and drops a row without id", () => {
  const id = "11111111-1111-4111-8111-111111111111"
  const routines = parsePublicRoutines([
    {
      routine_id: id,
      nombre: "Push",
      autor: "Ana",
      ejercicios: [{ nombre: "Press banca", series: 4 }, { nombre: " ", series: 2 }],
    },
    { routine_id: "nope", nombre: "Pull", autor: "Luis", ejercicios: [] },
  ])

  assert.deepEqual(routines, [
    {
      id,
      nombre: "Push",
      autor: "Ana",
      ejercicios: [{ nombre: "Press banca", series: 4 }],
    },
  ])
})
