import assert from "node:assert/strict"
import test from "node:test"

import { accessTokenNeedsRefresh } from "./access-token.ts"

function token(exp: number) {
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url")
  return `header.${payload}.signature`
}

test("a token that expires overnight needs a refresh", () => {
  const now = 1_700_000_000
  assert.equal(accessTokenNeedsRefresh(token(now - 3600), now), true)
  assert.equal(accessTokenNeedsRefresh(token(now + 30), now), true)
})

test("a token with time left is left alone", () => {
  const now = 1_700_000_000
  assert.equal(accessTokenNeedsRefresh(token(now + 3600), now), false)
  assert.equal(accessTokenNeedsRefresh(undefined, now), false)
})
