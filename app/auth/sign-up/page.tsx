import type { Metadata } from "next"

import { AuthHeader } from "@/features/auth/auth-header"
import { SignUpForm } from "@/features/auth/sign-up-form"

export const metadata: Metadata = {
  title: "Crear cuenta",
}

export default function SignUpPage() {
  return (
    <>
      <AuthHeader
        title="Crear cuenta"
        description="Un correo y una contraseña. Después confirmas el correo para entrar."
      />
      <SignUpForm />
    </>
  )
}
