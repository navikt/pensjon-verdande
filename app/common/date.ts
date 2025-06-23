export function formatIsoTimestamp(
  isoDate: string | undefined | null,
  includeMillis: boolean = false,
) {
  if (isoDate) {
    let date = new Date(isoDate)
    if (includeMillis) {
      return date.toLocaleString('no-NO') + '.' + date.getMilliseconds()
    } else {
      return date.toLocaleString('no-NO')
    }
  }
}


export function formatIsoDate(
  isoDate: string | undefined | null,
) {
  if (isoDate) {
    let date = new Date(isoDate)
      return date.toLocaleDateString('no-NO')
  }
}

// Basert på Wikipedia-artikkelen om Dato (ISO 8601), generert med Copilot
export const getDato = function(year: number, weekNumber: number, weekday: number) {
  // Step 1: Multiply the week number by 7 and add the weekday number
  let sum = weekNumber * 7 + weekday;

  // Step 2: Get the weekday of 4 January (0 = Sunday, 1 = Monday, ...)
  const jan4 = new Date(year, 0, 4);
  const jan4Weekday = jan4.getDay();

  // Step 3: Add 3 to the weekday of 4 January
  const correction = jan4Weekday + 3;

  // Step 4: Subtract the correction from the sum
  let ordinalDate = sum - correction;

  // Step 5: Determine the year the ordinal date belongs to
  let resultYear = year;
  const daysInYear = (new Date(year, 11, 31).getDate() === 31) ? 366 : 365;
  if (ordinalDate <= 0) {
    resultYear = year - 1;
    const prevYearDays = (new Date(resultYear, 11, 31).getDate() === 31) ? 366 : 365;
    ordinalDate += prevYearDays;
  } else if (ordinalDate > daysInYear) {
    resultYear = year + 1;
    ordinalDate -= daysInYear;
  }

  return new Date(resultYear, 0, ordinalDate);
}


export function isSameDay(date1: Date, date2: Date) {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

export function asLocalDateString(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
