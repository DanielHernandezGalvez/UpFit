"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updatePassword } from "@/features/auth/actions"
import { FormMessage } from "@/features/auth/form-message"
import type { AuthFormState } from "@/features/auth/types"
import { useAuthRedirect } from "@/features/auth/use-auth-redirect"

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    updatePassword,
    null,
  )
  useAuthRedirect(state)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormMessage error={state?.error} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">Confirmar contraseña</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>
      <Button type="submit" size="touch" className="w-full" disabled={pending}>
        {pending ? "Guardando..." : "Guardar contraseña"}
      </Button>
    </form>
  )
}
