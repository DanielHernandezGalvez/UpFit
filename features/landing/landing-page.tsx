import Link from "next/link"

import { Button } from "@/components/ui/button"

const steps = [
  {
    title: "Arma tus rutinas",
    text: "Elige ejercicios del catálogo o crea uno nuevo con su grupo muscular.",
  },
  {
    title: "Anota cada serie",
    text: "Peso y repeticiones con botones grandes, serie por serie, en el gym.",
  },
  {
    title: "Mira tu progreso",
    text: "Días entrenados, mejores marcas e historial de cada sesión.",
  },
]

export function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-8 md:max-w-3xl">
      <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        Upfit
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Tu entrenamiento, en el celular
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Registra rutinas, series y progreso. Se instala como app y se abre a
        pantalla completa.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          nativeButton={false}
          render={<Link href="/auth/sign-up" />}
          size="touch"
          className="w-full sm:flex-1"
        >
          Crear cuenta
        </Button>
        <Button
          nativeButton={false}
          render={<Link href="/auth/login" />}
          variant="outline"
          size="touch"
          className="w-full sm:flex-1"
        >
          Entrar
        </Button>
      </div>
      <ol className="mt-10 flex flex-col gap-3">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-3xl border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              {index + 1}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{step.title}</h2>
            <p className="mt-1 text-base leading-relaxed text-muted-foreground">
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </main>
  )
}
