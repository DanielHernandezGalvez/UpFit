import { PublicRoutineList } from "@/features/routines/public-routines"
import { loadPublicRoutinePage } from "@/features/routines/catalog-data"

export async function PublicRoutinesSection() {
  const page = await loadPublicRoutinePage(0)

  return (
    <section className="mt-4">
      <h2 className="text-lg font-semibold">Rutinas de otros</h2>
      {page.unavailable ? (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          El catálogo todavía no está listo.
        </p>
      ) : page.routines.length === 0 ? (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Cuando alguien publique una rutina, va a aparecer aquí. Las tuyas se publican desde Rutinas.
        </p>
      ) : (
        <PublicRoutineList initial={page.routines} initialHasMore={page.hasMore} />
      )}
    </section>
  )
}
