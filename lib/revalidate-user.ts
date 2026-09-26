import { revalidateTag } from "next/cache"

export function revalidateUserViews(userId: string) {
  revalidateTag(`dashboard:${userId}`, "max")
  revalidateTag(`history:${userId}`, "max")
}

export function embeddedCount(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return 0
  const count = (value[0] as { count?: number } | undefined)?.count
  return Number(count ?? 0)
}
