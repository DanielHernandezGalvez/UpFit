import assert from "node:assert/strict"
import test from "node:test"

import { generateRoutines } from "./generate.ts"

test("three push-pull days stay as one of each", () => {
  const routines = generateRoutines(
    {
      objetivo: "Hipertrofia",
      nivel: "Principiante",
      dias: 3,
      enfoque: "Empuje y tirón",
    },
    [],
  )

  assert.deepEqual(
    routines.map((routine) => routine.nombre),
    ["Empuje", "Tirón", "Pierna"],
  )
  assert.equal(routines[0].ejercicios.length, 4)
  assert.equal(routines[0].ejercicios[0].series, 4)
})

test("strength work asks for five sets", () => {
  const [routine] = generateRoutines(
    {
      objetivo: "Fuerza",
      nivel: "Intermedio",
      dias: 2,
      enfoque: "Torso y pierna",
    },
    [],
  )

  assert.equal(routine.ejercicios.length, 5)
  assert.ok(routine.ejercicios.every((item) => item.series === 5))
})

test("a second full-body day uses other exercises from the catalog", () => {
  const routines = generateRoutines(
    {
      objetivo: "Resistencia",
      nivel: "Principiante",
      dias: 2,
      enfoque: "Cuerpo completo",
    },
    [{ nombre: "Press inclinado", grupo: "Pecho" }],
  )

  assert.deepEqual(
    routines.map((routine) => routine.nombre),
    ["Cuerpo completo A", "Cuerpo completo B"],
  )
  assert.equal(routines[0].ejercicios[0].nombre, "Press inclinado")
  assert.notEqual(routines[0].ejercicios[0].nombre, routines[1].ejercicios[0].nombre)
  assert.equal(routines[0].ejercicios[0].series, 3)
})
