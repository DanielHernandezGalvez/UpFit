import assert from "node:assert/strict"
import test from "node:test"

import {
  INSTALL_DISMISS_MS,
  shouldShowInstallPrompt,
} from "./install-prompt.ts"

const now = Date.parse("2026-09-27T12:00:00Z")

test("shows the install prompt the first time it can be installed", () => {
  assert.equal(
    shouldShowInstallPrompt({
      now,
      dismissedAt: null,
      isStandalone: false,
      canPrompt: true,
      isIos: false,
    }),
    true,
  )
})

test("stays hidden after a recent dismissal", () => {
  assert.equal(
    shouldShowInstallPrompt({
      now,
      dismissedAt: now - 1000,
      isStandalone: false,
      canPrompt: true,
      isIos: false,
    }),
    false,
  )
})

test("shows again after two weeks", () => {
  assert.equal(
    shouldShowInstallPrompt({
      now,
      dismissedAt: now - INSTALL_DISMISS_MS,
      isStandalone: false,
      canPrompt: true,
      isIos: false,
    }),
    true,
  )
})

test("hides when the app is already installed", () => {
  assert.equal(
    shouldShowInstallPrompt({
      now,
      dismissedAt: null,
      isStandalone: true,
      canPrompt: true,
      isIos: false,
    }),
    false,
  )
})

test("shows iOS instructions without a native install event", () => {
  assert.equal(
    shouldShowInstallPrompt({
      now,
      dismissedAt: null,
      isStandalone: false,
      canPrompt: false,
      isIos: true,
    }),
    true,
  )
})
