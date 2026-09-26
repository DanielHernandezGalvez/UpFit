"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Dumbbell, House, Play } from "lucide-react"

const items = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/routines", label: "Rutinas", icon: Dumbbell },
  { href: "/workout", label: "Iniciar", icon: Play },
  { href: "/history", label: "Historial", icon: CalendarDays },
] as const

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppNav() {
  const pathname = usePathname()

  if (pathname.startsWith("/auth")) return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/6 bg-background/95 backdrop-blur-md md:sticky md:top-0 md:bottom-auto">
      <ul className="mx-auto flex w-full max-w-md items-stretch justify-around px-2 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] md:max-w-3xl md:justify-center md:gap-2 md:px-4 md:py-3">
        {items.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          const accent = item.href === "/workout"

          return (
            <li key={item.href} className="flex-1 md:flex-none">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-medium md:flex-row md:gap-2 md:rounded-full md:px-4 md:py-2 md:text-sm ${
                  accent
                    ? "text-foreground"
                    : active
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-full md:size-8 ${
                    accent
                      ? "bg-primary text-primary-foreground"
                      : active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  <Icon className={accent ? "size-4 fill-current" : "size-4"} />
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
