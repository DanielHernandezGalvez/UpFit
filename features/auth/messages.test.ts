import assert from "node:assert/strict"
import test from "node:test"

import { mapAuthError } from "./messages.ts"

test("translates known auth errors", () => {
  assert.equal(
    mapAuthError({ code: "invalid_credentials", message: "Invalid login credentials" }),
    "Correo o contraseña incorrectos.",
  )
  assert.equal(
    mapAuthError({ code: "email_not_confirmed", message: "Email not confirmed" }),
    "Confirma tu correo antes de entrar. Revisa la bandeja de entrada.",
  )
})

test("falls back to the English message when the code is missing", () => {
  assert.equal(
    mapAuthError({ message: "Invalid login credentials" }),
    "Correo o contraseña incorrectos.",
  )
})

test("hides unknown errors behind a generic message", () => {
  assert.equal(
    mapAuthError({ code: "unexpected", message: "database exploded" }),
    "No se pudo completar la acción. Inténtalo de nuevo.",
  )
})
