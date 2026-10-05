function tokenExpiry(token: string) {
  const payload = token.split(".")[1]
  if (!payload) return null

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    const json = JSON.parse(atob(padded)) as { exp?: unknown }
    return typeof json.exp === "number" ? json.exp : null
  } catch {
    return null
  }
}

export function accessTokenNeedsRefresh(
  token: string | undefined,
  nowSeconds: number,
  skewSeconds = 60,
) {
  if (!token) return false
  const expiry = tokenExpiry(token)
  if (expiry === null) return true
  return expiry <= nowSeconds + skewSeconds
}
