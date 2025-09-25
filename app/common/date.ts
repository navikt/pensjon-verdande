export function formatIsoTimestamp(isoDate: string | undefined | null, includeMillis: boolean = false) {
  if (isoDate) {
    const date = new Date(isoDate)
    if (includeMillis) {
      return `${date.toLocaleString('no-NO')}.${date.getMilliseconds()}`
    } else {
      return date.toLocaleString('no-NO')
    }
  }
}

export function formatIsoDate(isoDate: string | undefined | null) {
  if (isoDate) {
    const date = new Date(isoDate)
    return date.toLocaleDateString('no-NO')
  }
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Basert på Wikipedia-artikkelen om Dato (ISO 8601), generert med Copilot
export const getDato = (year: number, weekNumber: number, weekday: number) => {
  // Step 1: Multiply the week number by 7 and add the weekday number
  const sum = weekNumber * 7 + weekday

  // Step 2: Get the weekday of 4 January (0 = Sunday, 1 = Monday, ...)
  const jan4 = new Date(year, 0, 4)
  const jan4Weekday = jan4.getDay()

  // Step 3: Add 3 to the weekday of 4 January
  const correction = jan4Weekday + 3

  // Step 4: Subtract the correction from the sum
  let ordinalDate = sum - correction

  // Step 5: Determine the year the ordinal date belongs to
  let resultYear = year
  const daysInYear = new Date(year, 11, 31).getDate() === 31 ? 366 : 365
  if (ordinalDate <= 0) {
    resultYear = year - 1
    const prevYearDays = new Date(resultYear, 11, 31).getDate() === 31 ? 366 : 365
    ordinalDate += prevYearDays
  } else if (ordinalDate > daysInYear) {
    resultYear = year + 1
    ordinalDate -= daysInYear
  }

  return new Date(resultYear, 0, ordinalDate)
}

export function isSameDay(date1: Date | string, date2: Date | string) {
  if (typeof date1 === 'string') {
    date1 = new Date(date1)
  }

  if (typeof date2 === 'string') {
    date2 = new Date(date2)
  }

  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

export function asLocalDateString(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function erHelgedag(dato: Date): boolean {
  return dato.getDay() === 0 || dato.getDay() === 6
}

/**
 * Utility formatters
 */
const dtf = new Intl.DateTimeFormat('nb-NO', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function fmtDateTime(iso?: string | null) {
  if (!iso) return '–'
  try {
    return dtf.format(new Date(iso))
  } catch {
    return iso ?? '–'
  }
}

export function relativeFromNow(iso: string | null, nowIso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const diffMs = new Date(nowIso).getTime() - d.getTime()
  const minutes = Math.round(Math.abs(diffMs) / 60000)
  if (minutes < 1) return 'nå'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} t`
  const days = Math.round(hours / 24)
  return `${days} d`
}

export function formatBehandlingstid(fromIso: string | null, toIso: string | null, nowIso: string) {
  if (!fromIso) return { display: '–', title: '' }

  const start = new Date(fromIso)
  const end = toIso ? new Date(toIso) : new Date(nowIso)
  const diffMs = Math.max(0, end.getTime() - start.getTime())

  const totalSeconds = Math.floor(diffMs / 1000)
  const totalMinutes = Math.floor(totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalDays = Math.floor(totalHours / 24)

  const remHours = totalHours % 24
  const remMinutes = totalMinutes % 60
  const remSeconds = totalSeconds % 60

  const years = Math.floor(totalDays / 365)
  const daysAfterYears = totalDays % 365
  const months = Math.floor(daysAfterYears / 30)
  const remDays = daysAfterYears % 30

  let display: string
  if (totalDays >= 365) {
    const parts: string[] = []
    if (years > 0) parts.push(`${years} år`)
    if (months > 0) parts.push(`${months} mnd`)
    if (remDays > 0) parts.push(`${remDays} d`)
    display = parts.join(' ') || '0 d'
  } else if (totalDays >= 1) {
    display = `${totalDays} d${remHours > 0 ? ` ${remHours} t` : ''}`
  } else if (totalHours >= 1) {
    display = `${totalHours} t${remMinutes > 0 ? ` ${remMinutes} min` : ''}`
  } else if (totalMinutes >= 1) {
    display = `${totalMinutes} min${remSeconds > 0 ? ` ${remSeconds} s` : ''}`
  } else {
    display = `${totalSeconds} s`
  }

  const hh = String(remHours).padStart(2, '0')
  const mm = String(remMinutes).padStart(2, '0')
  const ss = String(remSeconds).padStart(2, '0')
  const exact = totalDays > 0 ? `${totalDays} dager, ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`

  return { display, title: exact }
}
