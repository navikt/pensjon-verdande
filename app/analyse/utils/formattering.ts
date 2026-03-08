export function formaterVarighet(sekunder: number | null | undefined): string {
  if (sekunder == null) return '–'
  if (sekunder < 60) return `${sekunder.toFixed(0)}s`
  if (sekunder < 3600) return `${Math.floor(sekunder / 60)}m ${Math.floor(sekunder % 60)}s`
  if (sekunder < 86400) return `${Math.floor(sekunder / 3600)}t ${Math.floor((sekunder % 3600) / 60)}m`
  return `${(sekunder / 86400).toFixed(1)} dager`
}

export function formaterVarighetDager(dager: number | null | undefined): string {
  if (dager == null) return '–'
  if (dager < 1) return `${Math.floor(dager * 24)}t`
  return `${dager.toFixed(1)} dg`
}

export function formaterProsent(teller: number, nevner: number): string {
  if (nevner === 0) return '–'
  return `${((teller / nevner) * 100).toFixed(1)}%`
}

export function formaterTall(tall: number | null | undefined): string {
  if (tall == null) return '–'
  return tall.toLocaleString('nb-NO')
}

export function formaterPeriodeLabel(periode: string): string {
  // Handle ISO datetime: "2024-12-25T14:00:00" or "2024-12-25T14:30"
  if (periode.includes('T')) {
    const [datePart, timePart] = periode.split('T')
    const [year, month, day] = datePart.split('-')
    const time = timePart.substring(0, 5) // HH:mm
    return `${day}.${month}.${year} ${time}`
  }
  const [year, month, day] = periode.split('-')
  if (day) return `${day}.${month}.${year}`
  if (month) return `${month}/${year}`
  return year
}

/** Formater fom/tom-verdi med sekundoppløsning: "25.12.2024 14:30:45" eller "25.12.2024" */
export function formaterTimestamp(value: string): string {
  if (value.includes('T')) {
    const [datePart, timePart] = value.split('T')
    const [year, month, day] = datePart.split('-')
    const time = timePart.substring(0, 8) // HH:mm:ss
    return `${day}.${month}.${year} ${time}`
  }
  const [year, month, day] = value.split('-')
  if (day) return `${day}.${month}.${year}`
  return value
}

/**
 * Normalize partial period strings (YYYY, YYYY-MM) to full YYYY-MM-DD.
 * Full dates (YYYY-MM-DD) and timestamps (YYYY-MM-DDThh:mm:ss) are returned as-is.
 * For 'start': YYYY → YYYY-01-01, YYYY-MM → YYYY-MM-01
 * For 'end': YYYY → YYYY-12-31, YYYY-MM → last day of month
 */
export function normalizePeriodToDate(period: string, edge: 'start' | 'end'): string {
  const datePart = period.split('T')[0]
  const segments = datePart.split('-')
  if (segments.length >= 3) return period // Already full date — preserve any time component

  const year = Number(segments[0])
  if (segments.length === 1) {
    return edge === 'start' ? `${datePart}-01-01` : `${datePart}-12-31`
  }
  // YYYY-MM
  if (edge === 'start') return `${datePart}-01`
  const month = Number(segments[1])
  const lastDay = new Date(year, month, 0).getDate()
  return `${datePart}-${String(lastDay).padStart(2, '0')}`
}
