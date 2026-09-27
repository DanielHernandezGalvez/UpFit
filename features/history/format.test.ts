import assert from "node:assert/strict"
import test from "node:test"

import { formatSessionDate } from "./format.ts"

test("formats a session date in Spanish without depending on the system locale", () => {
  assert.equal(formatSessionDate("2026-09-25"), "vie 25 sep")
})

test("returns the original text when the date is incomplete", () => {
  assert.equal(formatSessionDate("2026-09"), "2026-09")
})
