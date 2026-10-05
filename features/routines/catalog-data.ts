import {
  PUBLIC_PAGE_SIZE,
  parsePublicRoutines,
  publicPageOffset,
  takePublicPage,
  type PublicRoutine,
} from "@/features/routines/catalog"
import { getRequestAuth } from "@/lib/supabase/request-auth"

export type PublicRoutinePage = {
  routines: PublicRoutine[]
  hasMore: boolean
  unavailable: boolean
}

export async function loadPublicRoutinePage(offset: number): Promise<PublicRoutinePage> {
  const { supabase, user } = await getRequestAuth()

  if (!user) {
    return { routines: [], hasMore: false, unavailable: false }
  }

  const { data, error } = await supabase.rpc("list_public_routines", {
    page_limit: PUBLIC_PAGE_SIZE + 1,
    page_offset: publicPageOffset(offset),
  })

  if (error) {
    return { routines: [], hasMore: false, unavailable: true }
  }

  const page = takePublicPage(parsePublicRoutines(data), PUBLIC_PAGE_SIZE)
  return { routines: page.items, hasMore: page.hasMore, unavailable: false }
}
