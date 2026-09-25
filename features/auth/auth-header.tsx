export function AuthHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <header className="mb-8 space-y-2">
      <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Upfit
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
    </header>
  )
}
