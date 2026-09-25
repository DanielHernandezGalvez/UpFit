"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { mapAuthError } from "@/features/auth/messages"
import type { AuthFormState } from "@/features/auth/types"
import { createClient } from "@/lib/supabase/server"

async function getOrigin() {
  const headerStore = await headers()
  const origin = headerStore.get("origin")
  if (origin) return origin

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  const proto = headerStore.get("x-forwarded-proto") ?? "http"
  if (host) return `${proto}://${host}`

  return "http://localhost:3000"
}

function readEmail(formData: FormData) {
  return String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
}

function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value)
}

export async function login(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readEmail(formData)
  const password = String(formData.get("password") ?? "")

  if (!isEmail(email) || password.length < 6) {
    return { error: "Revisa el correo y la contraseña." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: mapAuthError(error) }
  }

  return { redirectTo: "/" }
}

export async function signUp(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const nombre = String(formData.get("nombre") ?? "").trim()
  const email = readEmail(formData)
  const password = String(formData.get("password") ?? "")

  if (nombre.length === 0 || nombre.length > 80) {
    return { error: "Escribe tu nombre." }
  }

  if (!isEmail(email)) {
    return { error: "Escribe un correo válido." }
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." }
  }

  const origin = await getOrigin()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: mapAuthError(error) }
  }

  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    return { error: "Ya existe una cuenta con ese correo. Inicia sesión." }
  }

  if (!data.session) {
    return {
      message:
        "Te enviamos un correo para confirmar la cuenta. Ábrelo en este mismo navegador, o entra con tu contraseña.",
    }
  }

  return { redirectTo: "/" }
}

export async function requestPasswordReset(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readEmail(formData)

  if (!isEmail(email)) {
    return { error: "Escribe un correo válido." }
  }

  const origin = await getOrigin()
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  })

  if (error) {
    return { error: mapAuthError(error) }
  }

  return {
    message:
      "Si el correo está registrado, te enviamos un enlace para elegir una nueva contraseña. Ábrelo en este mismo dispositivo.",
  }
}

export async function updatePassword(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm") ?? "")

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." }
  }

  if (password !== confirm) {
    return { error: "Las contraseñas no coinciden." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/forgot-password")
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: mapAuthError(error) }
  }

  return { redirectTo: "/" }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
