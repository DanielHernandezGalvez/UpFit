import type { Metadata } from "next"

import { AuthHeader } from "@/features/auth/auth-header"
import { UpdatePasswordForm } from "@/features/auth/update-password-form"

export const metadata: Metadata = {
  title: "Nueva contraseña",
}

export default function UpdatePasswordPage() {
  return (
    <>
      <AuthHeader
        title="Nueva contraseña"
        description="Elige una contraseña de al menos 6 caracteres."
      />
      <UpdatePasswordForm />
    </>
  )
}
