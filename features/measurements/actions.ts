"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { parseMeasurement } from "@/features/measurements/parse"
import type { RoutineFormState } from "@/features/routines/types"
import { getRequestAuth } from "@/lib/supabase/request-auth"

export async function saveMeasurement(
  _previous: RoutineFormState,
  formData: FormData,
): Promise<RoutineFormState> {
  const parsed = parseMeasurement({
    fecha: String(formData.get("fecha") ?? ""),
    peso: String(formData.get("peso") ?? ""),
    cintura: String(formData.get("cintura") ?? ""),
    pecho: String(formData.get("pecho") ?? ""),
    cadera: String(formData.get("cadera") ?? ""),
    brazo: String(formData.get("brazo") ?? ""),
    muslo: String(formData.get("muslo") ?? ""),
  })

  if ("error" in parsed) return parsed

  const { supabase, user } = await getRequestAuth()

  if (!user) redirect("/auth/login")

  const { error } = await supabase.from("body_measurements").insert({
    user_id: user.id,
    ...parsed.values,
  })

  if (error) {
    return { error: "No se pudo guardar. Aplica la migración nueva en Supabase." }
  }

  revalidatePath("/medidas")
  return null
}
