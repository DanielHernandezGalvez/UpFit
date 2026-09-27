import assert from "node:assert/strict"
import test from "node:test"

import {
  countTrainingDays,
  currentWeek,
  currentYearRange,
  formatKg,
  hasActiveStreak,
  isoDate,
  lastSevenDayRange,
  topPersonalRecords,
} from "./stats.ts"

const friday = new Date(2026, 8, 25)

test("isoDate uses the local calendar day", () => {
  assert.equal(isoDate(friday), "2026-09-25")
})

test("last seven days includes today and the six days before", () => {
  assert.deepEqual(lastSevenDayRange(friday), {
    start: "2026-09-19",
    end: "2026-09-25",
  })
})

test("current year starts on January 1", () => {
  assert.deepEqual(currentYearRange(friday), {
    year: 2026,
    start: "2026-01-01",
    end: "2026-09-25",
  })
})

test("training days count each date once", () => {
  assert.equal(
    countTrainingDays(["2026-09-23", "2026-09-23", "2026-09-25"]),
    2,
  )
})

test("the week starts on Monday and marks trained, missed, today and future", () => {
  const trained = new Set(["2026-09-24"])
  const week = currentWeek(trained, friday)

  assert.deepEqual(
    week.map((day) => day.label),
    ["L", "M", "M", "J", "V", "S", "D"],
  )
  assert.deepEqual(
    week.map((day) => [day.iso, day.status]),
    [
      ["2026-09-21", "missed"],
      ["2026-09-22", "missed"],
      ["2026-09-23", "missed"],
      ["2026-09-24", "trained"],
      ["2026-09-25", "today"],
      ["2026-09-26", "future"],
      ["2026-09-27", "future"],
    ],
  )
})

test("a streak is active when today or yesterday was trained", () => {
  assert.equal(hasActiveStreak(new Set(["2026-09-25"]), friday), true)
  assert.equal(hasActiveStreak(new Set(["2026-09-24"]), friday), true)
  assert.equal(hasActiveStreak(new Set(["2026-09-23"]), friday), false)
})

test("top personal records keeps the five heaviest exercises", () => {
  const records = topPersonalRecords(
    [
      { exerciseId: "a", nombre: "Press banca", grupo: "Pecho", peso: 60 },
      { exerciseId: "a", nombre: "Press banca", grupo: "Pecho", peso: 80 },
      { exerciseId: "b", nombre: "Sentadilla", grupo: "Pierna", peso: 100 },
      { exerciseId: "c", nombre: "Peso muerto", grupo: "Espalda", peso: 90 },
      { exerciseId: "d", nombre: "Remo", grupo: "Espalda", peso: 70 },
      { exerciseId: "e", nombre: "Curl", grupo: "Bíceps", peso: 30 },
      { exerciseId: "f", nombre: "Press militar", grupo: "Hombro", peso: 40 },
    ],
    5,
  )

  assert.deepEqual(
    records.map((record) => record.nombre),
    ["Sentadilla", "Peso muerto", "Press banca", "Remo", "Press militar"],
  )
  assert.equal(records[2]?.peso, 80)
})

test("formatKg keeps whole numbers without decimals", () => {
  assert.equal(formatKg(60), "60 kg")
  assert.match(formatKg(22.5), /^22[.,]5 kg$/)
})
