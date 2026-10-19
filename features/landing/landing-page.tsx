import Link from "next/link"
import {
  ArrowRight,
  Check,
  Dumbbell,
  Flame,
  History,
  Lock,
  Minus,
  Plus,
  Share,
  Smartphone,
  Trophy,
} from "lucide-react"

const muscleGroups = ["Pecho", "Espalda", "Hombro", "Tríceps", "Bíceps", "Pierna"]

const week = [
  { label: "L", trained: true },
  { label: "M", trained: true },
  { label: "M", missed: true },
  { label: "J", trained: true },
  { label: "V" },
  { label: "S" },
  { label: "D" },
]

const records = [
  { place: "1", nombre: "Peso muerto", grupo: "Espalda", peso: "140 kg" },
  { place: "2", nombre: "Sentadilla", grupo: "Pierna", peso: "120 kg" },
  { place: "3", nombre: "Press banca", grupo: "Pecho", peso: "85 kg" },
]

export function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-10 md:max-w-5xl md:px-6">
      <header className="flex items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Dumbbell className="size-5" strokeWidth={2.4} />
          </span>
          <span className="text-lg font-semibold tracking-tight">Fitrapp</span>
        </Link>
        <Link
          href="/auth/login"
          className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
        >
          Entrar
        </Link>
      </header>

      <section className="relative grid items-center gap-14 pt-6 pb-16 md:grid-cols-[1.1fr_0.9fr] md:pt-14 md:pb-24">
        <div className="absolute inset-x-[-1rem] top-[-5rem] -z-10 h-[28rem] bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.97_0.05_95),transparent)]" />

        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-sm">
            <Smartphone className="size-3.5" />
            App web instalable · Sin descargas
          </span>

          <h1 className="mt-5 text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-balance md:text-6xl">
            Anota cada serie.{" "}
            <span className="relative isolate whitespace-nowrap">
              <span className="absolute inset-x-[-0.12em] top-[58%] bottom-[0.02em] -z-10 rounded-sm bg-primary" />
              Rompe tus marcas.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Registra rutinas, pesos y repeticiones desde el celular, con botones
            grandes pensados para usar entre series. Sin libretas, sin hojas de
            cálculo.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/sign-up"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-primary-foreground sm:w-auto sm:min-w-52"
            >
              Crear cuenta
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-foreground/15 bg-background px-6 text-base font-medium sm:w-auto sm:min-w-40"
            >
              Entrar
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {[
              "Se abre a pantalla completa",
              "Series guardadas al instante",
              "Tus datos, solo tuyos",
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-4 text-foreground" strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-[16.5rem] sm:w-[18rem]" aria-hidden="true">
          <div className="absolute -inset-8 -z-10 rounded-full bg-[radial-gradient(closest-side,oklch(0.93_0.09_95),transparent)] opacity-80" />
          <div className="rounded-[2.5rem] border-[10px] border-foreground bg-background p-3 shadow-[0_30px_60px_-20px_oklch(0.2_0_0/0.35)]">
            <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-foreground/10" />
            <p className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Fitrapp
            </p>
            <p className="text-lg font-semibold tracking-tight">Hola, atleta</p>

            <div className="mt-3 rounded-2xl border bg-card p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  Últimos 7 días
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.95_0.04_55)] px-2 py-0.5 text-[10px] font-medium text-[oklch(0.42_0.12_45)]">
                  <Flame className="size-3 fill-current" />
                  Racha activa
                </span>
              </div>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-tight tabular-nums">3</span>
                <span className="text-xs text-muted-foreground">días entrenados</span>
              </p>
              <ol className="mt-3 grid grid-cols-7 gap-1">
                {week.map((day, index) => (
                  <li key={`${day.label}-${index}`} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground">{day.label}</span>
                    <span
                      className={
                        day.trained
                          ? "flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                          : day.missed
                            ? "flex size-6 items-center justify-center text-xs text-muted-foreground"
                            : "flex size-6 items-center justify-center rounded-full border border-dashed border-foreground/15"
                      }
                    >
                      {day.trained ? <Check className="size-3" strokeWidth={3} /> : day.missed ? "–" : null}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-3 rounded-2xl border bg-card p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  <Trophy className="size-4 text-[oklch(0.72_0.14_85)]" />
                  Mejores marcas
                </p>
                <span className="text-[10px] font-medium text-muted-foreground">PRs</span>
              </div>
              <ol className="mt-3 flex flex-col gap-2.5">
                {records.map((record) => (
                  <li key={record.place} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                        {record.place}
                      </span>
                      <span>
                        <span className="block text-xs leading-tight font-medium">{record.nombre}</span>
                        <span className="block text-[10px] text-muted-foreground">{record.grupo}</span>
                      </span>
                    </span>
                    <span className="text-xs font-semibold">{record.peso}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-3 flex h-10 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              Iniciar rutina
            </div>
          </div>

          <div className="absolute -left-4 top-24 hidden -rotate-4 items-center gap-2 rounded-2xl border bg-card px-3 py-2 shadow-sm sm:flex md:-left-10">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Trophy className="size-4" />
            </span>
            <span className="text-xs leading-tight">
              <span className="block font-semibold">¡Nueva marca!</span>
              <span className="block text-muted-foreground">Press banca · 85 kg</span>
            </span>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Todo lo que necesitas
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Lo justo para entrenar mejor. Nada que estorbe.
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border bg-card p-5 shadow-sm md:col-span-2">
            <Dumbbell className="size-6" />
            <h3 className="mt-4 text-xl font-semibold">Rutinas a tu medida</h3>
            <p className="mt-1.5 max-w-md text-base leading-relaxed text-muted-foreground">
              Crea tu Push, Pull, Legs o Upper. Usa el catálogo o agrega tus propios
              ejercicios y organízalos por grupo muscular.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {muscleGroups.map((group, index) => (
                <span
                  key={group}
                  className={
                    index === 0
                      ? "rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground"
                      : "rounded-full bg-secondary px-3.5 py-1.5 text-sm font-medium text-secondary-foreground"
                  }
                >
                  {group}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border bg-card p-5 shadow-sm">
            <h3 className="text-xl font-semibold">Series sin fricción</h3>
            <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
              Botones grandes, una mano y cero distracciones.
            </p>
            <div className="mt-4 flex flex-col gap-2" aria-hidden="true">
              {[
                ["Peso", "80 kg"],
                ["Reps", "8"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border bg-background p-2">
                  <span className="flex size-10 items-center justify-center rounded-full bg-secondary">
                    <Minus className="size-4" />
                  </span>
                  <span className="text-center leading-tight">
                    <span className="block text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                      {label}
                    </span>
                    <span className="block text-xl font-semibold tabular-nums">{value}</span>
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Plus className="size-4" />
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border bg-card p-5 shadow-sm">
            <Trophy className="size-6 text-[oklch(0.72_0.14_85)]" />
            <h3 className="mt-4 text-xl font-semibold">Tus mejores marcas</h3>
            <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
              Tus 5 ejercicios con más peso, siempre a la vista en el inicio.
            </p>
          </article>

          <article className="rounded-3xl border bg-card p-5 shadow-sm">
            <History className="size-6" />
            <h3 className="mt-4 text-xl font-semibold">Historial completo</h3>
            <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
              Cada sesión con fecha, ejercicios, series, peso y repeticiones.
            </p>
          </article>

          <article className="rounded-3xl border bg-card p-5 shadow-sm">
            <Lock className="size-6" />
            <h3 className="mt-4 text-xl font-semibold">Solo tuyo</h3>
            <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
              Cada persona ve y modifica únicamente sus propios datos.
            </p>
          </article>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Cómo funciona
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          De cero a tu primera sesión en tres pasos.
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            [
              "Arma tus rutinas",
              "Push, Pull, Legs, Upper… Elige ejercicios del catálogo o crea uno nuevo con su grupo muscular.",
            ],
            [
              "Anota cada serie",
              "Ajusta peso y repeticiones con + y −, toca Agregar serie y listo. Se guarda al instante.",
            ],
            [
              "Mira tu progreso",
              "Días entrenados, mejores marcas e historial completo de cada sesión.",
            ],
          ].map(([title, text], index) => (
            <li key={title} className="rounded-3xl border bg-card p-5 shadow-sm">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="py-12 md:py-16">
        <div className="grid gap-6 rounded-3xl border bg-accent p-6 md:grid-cols-[1fr_1.2fr] md:p-10">
          <div>
            <Smartphone className="size-7" />
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
              Instálala como una app de verdad
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Fitrapp es una PWA: queda en tu pantalla de inicio, se abre sin la barra
              del navegador y no necesitas tienda de apps.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold">Android · Chrome</p>
              <p className="mt-1.5 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <Plus className="mt-0.5 size-4 text-foreground" />
                <span>
                  Abre el menú y elige <strong className="text-foreground">Instalar app</strong>.
                </span>
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold">iPhone · Safari</p>
              <p className="mt-1.5 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <Share className="mt-0.5 size-4 text-foreground" />
                <span>
                  Toca Compartir y luego{" "}
                  <strong className="text-foreground">Agregar a pantalla de inicio</strong>.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="rounded-3xl bg-foreground px-6 py-12 text-center text-background md:py-16">
          <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight text-balance md:text-5xl">
            Tu próximo récord empieza hoy.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-background/70">
            Crea tu cuenta, arma tu primera rutina y anota tu primera serie en minutos.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link
              href="/auth/sign-up"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-primary-foreground sm:w-auto sm:min-w-56"
            >
              Crear cuenta
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-background/80 underline underline-offset-4 hover:text-background"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      <footer className="flex items-center justify-between border-t pt-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-2 font-medium text-foreground">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Dumbbell className="size-3.5" strokeWidth={2.4} />
          </span>
          Fitrapp
        </span>
        <span>Hecho para entrenar</span>
      </footer>
    </main>
  )
}
