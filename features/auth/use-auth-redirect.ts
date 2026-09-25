"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import type { AuthFormState } from "@/features/auth/types"

export function useAuthRedirect(state: AuthFormState) {
  const router = useRouter()

  useEffect(() => {
    if (!state?.redirectTo) return
    router.replace(state.redirectTo)
    router.refresh()
  }, [router, state])
}
