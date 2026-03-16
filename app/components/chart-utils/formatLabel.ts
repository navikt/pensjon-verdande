export function formatLabel(iso: string, antallTimer: number): string {
  const [datePart, timePart] = iso.split('T')
  const [, month, day] = datePart.split('-')
  const hour = timePart?.substring(0, 2) ?? '00'
  if (antallTimer <= 48) {
    return `${hour}:00`
  }
  return `${day}.${month} ${hour}:00`
}
