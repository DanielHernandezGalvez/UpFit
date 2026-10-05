function cleanBase(value: string | null | undefined) {
  if (!value) return null
  const trimmed = value.trim().replace(/\/+$/, "")
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function hostnameOf(value: string) {
  try {
    return new URL(value).hostname.toLowerCase()
  } catch {
    return value.split(":")[0]?.toLowerCase() ?? ""
  }
}

export function isLocalUrl(value: string) {
  const host = hostnameOf(value)
  return host === "localhost" || host === "127.0.0.1" || host === "::1"
}

export function resolveAuthOrigin(input: {
  origin: string | null
  forwardedHost: string | null
  host: string | null
  forwardedProto: string | null
  siteUrl?: string | null
  vercelProductionHost?: string | null
}) {
  const explicit = cleanBase(input.siteUrl)
  if (explicit && !isLocalUrl(explicit)) return explicit

  const production = cleanBase(input.vercelProductionHost)
  if (production && !isLocalUrl(production)) return production

  if (input.origin && !isLocalUrl(input.origin)) return input.origin.replace(/\/+$/, "")

  const host = input.forwardedHost ?? input.host
  if (host && !isLocalUrl(host)) {
    const proto = input.forwardedProto ?? "https"
    return `${proto}://${host}`
  }

  if (input.origin) return input.origin.replace(/\/+$/, "")
  if (host) return `${input.forwardedProto ?? "http"}://${host}`
  return explicit ?? "http://localhost:3000"
}
