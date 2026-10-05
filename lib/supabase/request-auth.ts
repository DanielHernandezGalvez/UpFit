import { createClient } from "@/lib/supabase/server"

export async function getRequestAuth() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return { supabase, session, user: session?.user ?? null }
}
