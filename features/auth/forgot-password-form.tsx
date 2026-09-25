"use client"

import Link from "next/link"
import { useActionState, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordReset } from "@/features/auth/actions"
import type { AuthFormState } from "@/features/auth/types"
import { FormMessage } from "@/features/auth/form-message"

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    requestPasswordReset,
    null,
  )
  const [email, setEmail] = useState("")

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormMessage error={state?.error} message={state?.message} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <Button type="submit" size="touch" className="w-full" disabled={pending}>
        {pending ? "Enviando..." : "Enviar enlace"}
      </Button>
      <p className="text-center text-base">
        <Link
          href="/auth/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Volver a entrar
        </Link>
      </p>
    </form>
  )
}
