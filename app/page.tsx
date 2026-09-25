import Link from "next/link"
import { redirect } from "next/navigation"
import {
  CalendarDays,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  LogOut,
  Play,
  Trophy,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { logout } from "@/features/auth/actions"
import { formatKg } from "@/features/dashboard/stats"
import { getDashboard } from "@/features/dashboard/get-dashboard"

function initials(nombre: string) {
  const parts = nombre.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "WT"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function daysLabel(count: number) {
  return count === 1 ? "día entrenado" : "días entrenados"
}

export default async function HomePage() {
  const dashboard = await getDashboard()

  if (!dashboard) {
    redirect("/auth/login")
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-6 pb-28">
      <header className="flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
          {initials(dashboard.nombre)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Upfit
          </p>
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            Hola, {dashboard.nombre}
          </h1>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground"
          >
            Salir
            <LogOut className="size-4" />
          </button>
        </form>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button
          nativeButton={false}
          render={<Link href="/routines" />}
          variant="outline"
          className="h-14 w-full justify-between px-3"
        >
          <span className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-muted">
              <Dumbbell className="size-4" />
            </span>
            <span className="text-sm">Mis rutinas</span>
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Button>
        <Button
          nativeButton={false}
          render={<Link href="/history" />}
          variant="outline"
          className="h-14 w-full justify-between px-3"
        >
          <span className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-muted">
              <CalendarDays className="size-4" />
            </span>
            <span className="text-sm">Historial</span>
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Button>
      </div>

      <section className="mt-4 rounded-3xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Últimos 7 días
          </p>
          {dashboard.streakActive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.95_0.04_55)] px-2.5 py-1 text-xs font-medium text-[oklch(0.42_0.12_45)]">
              <Flame className="size-3.5 fill-current" />
              Racha activa
            </span>
          ) : null}
        </div>
        <p className="mt-3 flex items-baseline gap-2">
          <span className="text-5xl font-semibold tracking-tight tabular-nums">
            {dashboard.trainingDays}
          </span>
          <span className="text-base text-muted-foreground">
            {daysLabel(dashboard.trainingDays)}
          </span>
        </p>
        <ol className="mt-5 grid grid-cols-7 gap-1">
          {dashboard.weekDays.map((day) => (
            <li key={day.iso} className="flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {day.label}
              </span>
              <span
                className={
                  day.status === "trained"
                    ? "flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    : day.status === "future" || day.status === "today"
                      ? "flex size-8 items-center justify-center rounded-full border border-dashed border-foreground/15"
                      : "flex size-8 items-center justify-center text-muted-foreground"
                }
              >
                {day.status === "trained" ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : day.status === "missed" ? (
                  "–"
                ) : null}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          {dashboard.trainingDaysThisYear}{" "}
          {dashboard.trainingDaysThisYear === 1 ? "día" : "días"} en{" "}
          {dashboard.year}
        </p>
      </section>

      <section className="mt-4 rounded-3xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Trophy className="size-5 text-[oklch(0.72_0.14_85)]" />
            Mejores marcas
          </h2>
          <span className="text-sm font-medium text-muted-foreground">PRs</span>
        </div>
        {dashboard.records.length === 0 ? (
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Cuando registres series, aquí verás los 3 ejercicios con más peso.
          </p>
        ) : (
          <ol className="mt-4 flex flex-col gap-4">
            {dashboard.records.map((record, index) => (
              <li
                key={record.exerciseId}
                className="flex items-center justify-between gap-3"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base font-medium">
                      {record.nombre}
                    </span>
                    {record.grupo ? (
                      <span className="block truncate text-sm text-muted-foreground">
                        {record.grupo}
                      </span>
                    ) : null}
                  </span>
                </span>
                <span className="shrink-0 text-base font-semibold">
                  {formatKg(record.peso)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-md">
          <Button
            nativeButton={false}
            render={<Link href="/workout" />}
            size="touch"
            className="w-full shadow-sm"
          >
            <Play className="fill-current" />
            Iniciar rutina
          </Button>
        </div>
      </div>
    </main>
  )
}
