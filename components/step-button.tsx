export function StepButton({
  label,
  symbol,
  onClick,
}: {
  label: string
  symbol: "−" | "+"
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 shrink-0 items-center justify-center rounded-full border bg-card text-lg leading-none"
    >
      {symbol}
    </button>
  )
}
