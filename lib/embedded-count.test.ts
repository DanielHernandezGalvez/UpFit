import assert from "node:assert/strict"
import test from "node:test"

import { embeddedCount } from "./embedded-count.ts"

test("reads the set count returned by Supabase", () => {
  assert.equal(embeddedCount([{ count: 4 }]), 4)
})

test("treats a missing count as zero", () => {
  assert.equal(embeddedCount([]), 0)
  assert.equal(embeddedCount(null), 0)
  assert.equal(embeddedCount([{ count: undefined }]), 0)
})
