"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { FormMessage } from "@/features/auth/form-message"
import { publishRoutine, unpublishRoutine } from "@/features/routines/catalog-actions"

export function PublishRoutineButton({
  routineId,
  published,
}: {
  routineId: string
  published: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  async function toggle() {
    setPending(true)
    setError(undefined)
    const result = published
      ? await unpublishRoutine(routineId)
      : await publishRoutine(routineId)
    setPending(false)

    if (result.error) {
      setError(result.error)
      return
    }

    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="outline" onClick={() => void toggle()} disabled={pending}>
        {pending ? "Guardando..." : published ? "Quitar del catálogo" : "Publicar"}
      </Button>
      {published ? (
        <p className="text-sm text-muted-foreground">Visible para otras personas.</p>
      ) : null}
      <FormMessage error={error} />
    </div>
  )
}
