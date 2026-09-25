"use client"

import Link from "next/link"
import { useActionState, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/features/auth/actions"
import { FormMessage } from "@/features/auth/form-message"
import type { AuthFormState } from "@/features/auth/types"
import { useAuthRedirect } from "@/features/auth/use-auth-redirect"

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    login,
    null,
  )
  const [email, setEmail] = useState("")
  useAuthRedirect(state)
  const error = state ? state.error : initialError

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormMessage error={error} />
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
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={6}
          required
        />
      </div>
      <Button type="submit" size="touch" className="w-full" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </Button>
      <div className="flex flex-col items-center gap-3 pt-1 text-base">
        <Link
          href="/auth/forgot-password"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Olvidé mi contraseña
        </Link>
        <Link href="/auth/sign-up" className="text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <span className="font-medium text-foreground underline underline-offset-4">
            Crear cuenta
          </span>
        </Link>
      </div>
    </form>
  )
}
