import type { Metadata } from "next"

import { AuthHeader } from "@/features/auth/auth-header"
import { LoginForm } from "@/features/auth/login-form"

export const metadata: Metadata = {
  title: "Entrar",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const initialError =
    error === "enlace"
      ? "No pudimos abrir ese enlace. Entra con tu correo y contraseña."
      : undefined

  return (
    <>
      <AuthHeader
        title="Entrar"
        description="Usa el correo y la contraseña de tu cuenta."
      />
      <LoginForm initialError={initialError} />
    </>
  )
}
