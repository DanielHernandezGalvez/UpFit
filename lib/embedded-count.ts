export function embeddedCount(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return 0
  const count = (value[0] as { count?: number } | undefined)?.count
  return Number(count ?? 0)
}
