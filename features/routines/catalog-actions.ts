"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { loadPublicRoutinePage, type PublicRoutinePage } from "@/features/routines/catalog-data"
import type { RoutineFormState } from "@/features/routines/types"
import { getRequestAuth } from "@/lib/supabase/request-auth"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function requireUser() {
  const { supabase, user } = await getRequestAuth()

  if (!user) {
    redirect("/auth/login")
  }

  return { supabase, user }
}

export async function loadMorePublicRoutines(offset: number): Promise<PublicRoutinePage> {
  return loadPublicRoutinePage(offset)
}

export async function publishRoutine(routineId: string): Promise<{ error?: string }> {
  if (!UUID_PATTERN.test(routineId)) {
    return { error: "No encontramos esa rutina." }
  }

  const { supabase, user } = await requireUser()
  const { error } = await supabase.from("routine_publications").insert({
    routine_id: routineId,
    owner_id: user.id,
  })

  if (error && error.code !== "23505") {
    return { error: "No se pudo publicar. Aplica la migración nueva en Supabase." }
  }

  revalidatePath("/")
  revalidatePath("/routines")
  return {}
}

export async function unpublishRoutine(routineId: string): Promise<{ error?: string }> {
  if (!UUID_PATTERN.test(routineId)) {
    return { error: "No encontramos esa rutina." }
  }

  const { supabase } = await requireUser()
  const { error } = await supabase
    .from("routine_publications")
    .delete()
    .eq("routine_id", routineId)

  if (error) {
    return { error: "No se pudo quitar del catálogo." }
  }

  revalidatePath("/")
  revalidatePath("/routines")
  return {}
}

export async function copyPublicRoutine(
  _previous: RoutineFormState,
  formData: FormData,
): Promise<RoutineFormState> {
  const routineId = String(formData.get("routineId") ?? "")

  if (!UUID_PATTERN.test(routineId)) {
    return { error: "No encontramos esa rutina." }
  }

  const { supabase } = await requireUser()
  const { data, error } = await supabase.rpc("copy_public_routine", {
    source_routine_id: routineId,
  })

  if (error || !data) {
    if (error?.message.includes("own routine")) {
      return { error: "Esa rutina ya es tuya." }
    }
    if (error?.message.includes("not published")) {
      return { error: "Esa rutina ya no está publicada." }
    }
    return { error: "No se pudo agregar la rutina." }
  }

  revalidatePath("/routines")
  revalidatePath("/workout")
  return { redirectTo: `/routines/${data}` }
}
