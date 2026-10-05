"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  INSTALL_DISMISS_KEY,
  shouldShowInstallPrompt,
} from "@/features/pwa/install-prompt"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function readDismissedAt() {
  const raw = window.localStorage.getItem(INSTALL_DISMISS_KEY)
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [ios, setIos] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", onPrompt)
    setIos(isIos())

    const timer = window.setTimeout(() => {
      const visible = shouldShowInstallPrompt({
        now: Date.now(),
        dismissedAt: readDismissedAt(),
        isStandalone: isStandalone(),
        canPrompt: false,
        isIos: isIos(),
      })
      if (visible && isIos()) setOpen(true)
    }, 6000)

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!deferred) return
    const visible = shouldShowInstallPrompt({
      now: Date.now(),
      dismissedAt: readDismissedAt(),
      isStandalone: isStandalone(),
      canPrompt: true,
      isIos: false,
    })
    if (visible) setOpen(true)
  }, [deferred])

  function dismiss() {
    window.localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()))
    setOpen(false)
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome === "accepted") {
      window.localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()))
    }
    setDeferred(null)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-x-0 bottom-24 z-50 px-4 md:bottom-6">
      <div
        role="dialog"
        aria-labelledby="install-title"
        className="mx-auto w-full max-w-md rounded-3xl border bg-card p-4 shadow-sm"
      >
        <h2 id="install-title" className="text-lg font-semibold">
          Instala Upfit
        </h2>
        <p className="mt-1 text-base leading-relaxed text-muted-foreground">
          {ios
            ? "En Safari, pulsa Compartir y luego Agregar a pantalla de inicio."
            : "Ábrela desde el icono, a pantalla completa, como una app."}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {deferred ? (
            <Button type="button" size="touch" className="w-full" onClick={() => void install()}>
              Instalar
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="touch" className="w-full" onClick={dismiss}>
            Ahora no
          </Button>
        </div>
      </div>
    </div>
  )
}
