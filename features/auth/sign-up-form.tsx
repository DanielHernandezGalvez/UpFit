"use client"

import Link from "next/link"
import { useActionState, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/features/auth/actions"
import { FormMessage } from "@/features/auth/form-message"
import type { AuthFormState } from "@/features/auth/types"
import { useAuthRedirect } from "@/features/auth/use-auth-redirect"

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signUp,
    null,
  )
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  useAuthRedirect(state)

  if (state?.message) {
    return (
      <div className="flex flex-col gap-5">
        <FormMessage message={state.message} />
        <Button
          nativeButton={false}
          render={<Link href="/auth/login" />}
          size="touch"
          className="w-full"
        >
          Ir a entrar
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormMessage error={state?.error} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          name="nombre"
          autoComplete="name"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          required
          maxLength={80}
        />
      </div>
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
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>
      <Button type="submit" size="touch" className="w-full" disabled={pending}>
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
      <p className="text-center text-base text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Entrar
        </Link>
      </p>
    </form>
  )
}
