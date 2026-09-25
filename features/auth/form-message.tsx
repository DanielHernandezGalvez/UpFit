export function FormMessage({
  error,
  message,
}: {
  error?: string
  message?: string
}) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        {error}
      </p>
    )
  }

  if (message) {
    return (
      <p role="status" className="rounded-xl bg-muted px-4 py-3 text-sm">
        {message}
      </p>
    )
  }

  return null
}
