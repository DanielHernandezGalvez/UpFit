import { redirect } from "next/navigation"

import { MeasurementForm } from "@/features/measurements/measurement-form"
import { getRequestAuth } from "@/lib/supabase/request-auth"

type Measurement = {
  id: string
  fecha: string
  peso: number | null
  cintura: number | null
  pecho: number | null
  cadera: number | null
  brazo: number | null
  muslo: number | null
}

const labels: { key: keyof Omit<Measurement, "id" | "fecha">; label: string; unit: string }[] = [
  { key: "peso", label: "Peso", unit: "kg" },
  { key: "cintura", label: "Cintura", unit: "cm" },
  { key: "pecho", label: "Pecho", unit: "cm" },
  { key: "cadera", label: "Cadera", unit: "cm" },
  { key: "brazo", label: "Brazo", unit: "cm" },
  { key: "muslo", label: "Muslo", unit: "cm" },
]

export default async function MeasurementsPage() {
  const { supabase, user } = await getRequestAuth()

  if (!user) redirect("/auth/login")

  const { data } = await supabase
    .from("body_measurements")
    .select("id, fecha, peso, cintura, pecho, cadera, brazo, muslo")
    .order("fecha", { ascending: false })
    .limit(30)

  const records = (data ?? []) as Measurement[]

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 pt-8 pb-24 md:max-w-3xl md:pb-10">
      <header className="space-y-2">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Upfit
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Peso y medidas</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Opcional. Escribe solo lo que quieras seguir.
        </p>
      </header>
      <section className="rounded-3xl border bg-card p-4 shadow-sm">
        <MeasurementForm />
      </section>
      <ul className="flex flex-col gap-3">
        {records.map((record) => (
          <li key={record.id} className="rounded-3xl border bg-card p-4 shadow-sm">
            <p className="font-semibold">{record.fecha}</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
              {labels.flatMap((item) => {
                const value = record[item.key]
                if (value === null) return []
                return [
                  <li key={item.key}>
                    {item.label}: {value} {item.unit}
                  </li>,
                ]
              })}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  )
}
