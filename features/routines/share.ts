const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function createShareCode(bytes: Uint8Array = crypto.getRandomValues(new Uint8Array(8))) {
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("")
}

export function normalizeShareCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
}
