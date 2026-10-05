"use client"

import { useActionState, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormMessage } from "@/features/auth/form-message"
import { useAuthRedirect } from "@/features/auth/use-auth-redirect"
import { importRoutine, shareRoutine } from "@/features/routines/actions"
import type { RoutineFormState } from "@/features/routines/types"

export function ShareRoutineButton({ routineId }: { routineId: string }) {
  const [code, setCode] = useState<string>()
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  async function share() {
    setPending(true)
    setError(undefined)
    const result = await shareRoutine(routineId)
    setPending(false)
    if ("error" in result) {
      setError(result.error)
      return
    }
    setCode(result.code)
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="outline" onClick={() => void share()} disabled={pending}>
        {pending ? "Creando..." : "Compartir"}
      </Button>
      {code ? (
        <p className="text-sm">
          Código: <span className="font-semibold tracking-wide">{code}</span>
        </p>
      ) : null}
      <FormMessage error={error} />
    </div>
  )
}

export function ImportRoutineForm() {
  const [state, formAction, pending] = useActionState<RoutineFormState, FormData>(
    importRoutine,
    null,
  )
  useAuthRedirect(state)

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-3xl border bg-card p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Importar rutina</h2>
      <FormMessage error={state?.error} />
      <Input
        name="code"
        aria-label="Código de rutina"
        placeholder="Código de 8 caracteres"
        autoCapitalize="characters"
        maxLength={12}
      />
      <Button type="submit" variant="secondary" size="touch" className="w-full" disabled={pending}>
        {pending ? "Importando..." : "Importar"}
      </Button>
    </form>
  )
}
