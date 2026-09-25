import type { Metadata } from "next"

import { AuthHeader } from "@/features/auth/auth-header"
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Recuperar contraseña",
}

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader
        title="Recuperar contraseña"
        description="Te enviamos un enlace para elegir una nueva."
      />
      <ForgotPasswordForm />
    </>
  )
}
