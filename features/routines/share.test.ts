import assert from "node:assert/strict"
import test from "node:test"

import { createShareCode, normalizeShareCode } from "./share.ts"

test("share codes are 8 characters from an unambiguous alphabet", () => {
  const code = createShareCode(new Uint8Array([0, 1, 10, 20, 30, 31, 32, 33]))
  assert.equal(code.length, 8)
  assert.match(code, /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/)
  assert.equal(code.includes("0"), false)
  assert.equal(code.includes("1"), false)
  assert.equal(code.includes("I"), false)
  assert.equal(code.includes("O"), false)
})

test("normalizes a shared code typed with spaces", () => {
  assert.equal(normalizeShareCode(" ab-12 cd "), "AB12CD")
})
