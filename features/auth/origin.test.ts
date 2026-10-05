import assert from "node:assert/strict"
import test from "node:test"

import { resolveAuthOrigin } from "./origin.ts"

test("auth emails use the published site instead of localhost", () => {
  assert.equal(
    resolveAuthOrigin({
      origin: "http://localhost:3000",
      forwardedHost: "localhost:3000",
      host: "localhost:3000",
      forwardedProto: "http",
      vercelProductionHost: "upfit.vercel.app",
    }),
    "https://upfit.vercel.app",
  )
})

test("an explicit public site wins over the request host", () => {
  assert.equal(
    resolveAuthOrigin({
      origin: "https://preview.vercel.app",
      forwardedHost: null,
      host: "preview.vercel.app",
      forwardedProto: "https",
      siteUrl: "https://upfit.vercel.app/",
    }),
    "https://upfit.vercel.app",
  )
})

test("local development stays on localhost when no public site is configured", () => {
  assert.equal(
    resolveAuthOrigin({
      origin: "http://localhost:3000",
      forwardedHost: null,
      host: "localhost:3000",
      forwardedProto: "http",
    }),
    "http://localhost:3000",
  )
})
