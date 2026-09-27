import assert from "node:assert/strict"
import test from "node:test"

import { isMuscleGroup } from "./muscle-groups.ts"

test("accepts the muscle groups stored in the database", () => {
  assert.equal(isMuscleGroup("Pierna"), true)
  assert.equal(isMuscleGroup("Tríceps"), true)
})

test("rejects groups that are not in the catalog", () => {
  assert.equal(isMuscleGroup("Abdomen"), false)
  assert.equal(isMuscleGroup("pierna"), false)
})
