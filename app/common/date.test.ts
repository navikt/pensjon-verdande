import { describe, expect, it } from 'vitest'
import { getDato } from '~/common/date'
import { getWeek, getWeekYear } from '~/common/weeknumber'

function localDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

describe('getDato', () => {
  it('returnerer mandag i ISO-uke 1, 2026 (jan 4 er søndag)', () => {
    // 2026: Jan 4 er søndag, ISO-uke 1 starter mandag 29. desember 2025
    expect(localDateString(getDato(2026, 1, 1))).toBe('2025-12-29')
  })

  it('returnerer mandag i ISO-uke 14, 2026 (inneholder 1. april)', () => {
    // ISO-uke 14 i 2026 starter mandag 30. mars
    expect(localDateString(getDato(2026, 14, 1))).toBe('2026-03-30')
  })

  it('returnerer mandag i ISO-uke 1, 2025 (jan 4 er lørdag)', () => {
    // 2025: Jan 4 er lørdag, ISO-uke 1 starter mandag 30. desember 2024
    expect(localDateString(getDato(2025, 1, 1))).toBe('2024-12-30')
  })

  it('returnerer mandag i ISO-uke 1, 2024 (jan 4 er torsdag)', () => {
    // 2024: Jan 4 er torsdag, ISO-uke 1 starter mandag 1. januar
    expect(localDateString(getDato(2024, 1, 1))).toBe('2024-01-01')
  })

  it('er invers av getWeek for mandag', () => {
    // For en vilkårlig dato, getDato(getWeekYear(d), getWeek(d), 1) skal gi mandagen i samme uke
    const testDates = [
      new Date(2026, 3, 1), // April 1, 2026 (onsdag)
      new Date(2026, 3, 4), // April 4, 2026 (lørdag)
      new Date(2026, 0, 1), // Jan 1, 2026 (torsdag)
      new Date(2025, 11, 31), // Dec 31, 2025 (onsdag)
      new Date(2024, 0, 1), // Jan 1, 2024 (mandag)
    ]

    for (const d of testDates) {
      const weekYear = getWeekYear(d)
      const week = getWeek(d)
      const monday = getDato(weekYear, week, 1)

      // Mandag skal være i samme ISO-uke
      expect(getWeek(monday)).toBe(week)
      expect(getWeekYear(monday)).toBe(weekYear)
      // Mandag skal faktisk være en mandag (getDay() === 1)
      expect(monday.getDay()).toBe(1)
      // Mandag skal være <= datoen (eller i samme uke)
      const diffDays = (d.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24)
      expect(diffDays).toBeGreaterThanOrEqual(0)
      expect(diffDays).toBeLessThan(7)
    }
  })
})
