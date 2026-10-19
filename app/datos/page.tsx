import { redirect } from "next/navigation"

import { TrainingForm } from "@/features/routines/training-form"
import {
  clampTrainingDays,
  isTrainingFocus,
  isTrainingGoal,
  isTrainingLevel,
} from "@/features/routines/generate"
import { getRequestAuth } from "@/lib/supabase/request-auth"

export default async function TrainingProfilePage() {
  const { supabase, user } = await getRequestAuth()
  if (!user) redirect("/auth/login")

  const { data } = await supabase
    .from("profiles")
    .select("objetivo, nivel, dias_por_semana, enfoque")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 pt-8 pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:max-w-3xl md:pb-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Tus datos</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Con esto se arman rutinas nuevas. Si ya tienes una con el mismo nombre, no se reemplaza.
        </p>
      </header>
      <section className="rounded-3xl border bg-card p-4 shadow-sm">
        <TrainingForm
          initialGoal={data?.objetivo && isTrainingGoal(data.objetivo) ? data.objetivo : undefined}
          initialLevel={data?.nivel && isTrainingLevel(data.nivel) ? data.nivel : undefined}
          initialDays={
            typeof data?.dias_por_semana === "number"
              ? clampTrainingDays(data.dias_por_semana)
              : undefined
          }
          initialFocus={data?.enfoque && isTrainingFocus(data.enfoque) ? data.enfoque : undefined}
        />
      </section>
    </main>
  )
}
