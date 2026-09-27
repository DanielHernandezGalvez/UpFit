import { revalidateTag } from "next/cache"

export function revalidateUserViews(userId: string) {
  revalidateTag(`dashboard:${userId}`, "max")
  revalidateTag(`history:${userId}`, "max")
}
