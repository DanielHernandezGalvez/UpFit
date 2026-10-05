export const INSTALL_DISMISS_KEY = "upfit-install-dismissed-at"
export const INSTALL_DISMISS_MS = 14 * 24 * 60 * 60 * 1000

export function shouldShowInstallPrompt(input: {
  now: number
  dismissedAt: number | null
  isStandalone: boolean
  canPrompt: boolean
  isIos: boolean
}) {
  if (input.isStandalone) return false
  if (!input.canPrompt && !input.isIos) return false
  if (input.dismissedAt === null) return true
  return input.now - input.dismissedAt >= INSTALL_DISMISS_MS
}
