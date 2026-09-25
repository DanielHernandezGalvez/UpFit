const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"]
const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
]

export function formatSessionDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number)
  if (!year || !month || !day) return isoDate

  const date = new Date(year, month - 1, day)
  return `${WEEKDAYS[date.getDay()]} ${day} ${MONTHS[month - 1]}`
}
