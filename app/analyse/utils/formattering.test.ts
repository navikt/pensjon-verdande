import { describe, expect, it } from 'vitest'
import {
  formaterPeriodeLabel,
  formaterProsent,
  formaterTall,
  formaterTimestamp,
  formaterVarighet,
  formaterVarighetDager,
  normalizePeriodToDate,
} from './formattering'

describe('formaterVarighet', () => {
  it('returnerer "–" for null og undefined', () => {
    expect(formaterVarighet(null)).toBe('–')
    expect(formaterVarighet(undefined)).toBe('–')
  })

  it('formaterer sekunder under 60', () => {
    expect(formaterVarighet(0)).toBe('0s')
    expect(formaterVarighet(30)).toBe('30s')
    expect(formaterVarighet(59.9)).toBe('60s')
  })

  it('formaterer minutter og sekunder', () => {
    expect(formaterVarighet(60)).toBe('1m 0s')
    expect(formaterVarighet(90)).toBe('1m 30s')
    expect(formaterVarighet(3599)).toBe('59m 59s')
  })

  it('formaterer timer og minutter', () => {
    expect(formaterVarighet(3600)).toBe('1t 0m')
    expect(formaterVarighet(7260)).toBe('2t 1m')
    expect(formaterVarighet(86399)).toBe('23t 59m')
  })

  it('formaterer dager', () => {
    expect(formaterVarighet(86400)).toBe('1.0 dager')
    expect(formaterVarighet(172800)).toBe('2.0 dager')
    expect(formaterVarighet(259200)).toBe('3.0 dager')
  })
})

describe('formaterVarighetDager', () => {
  it('returnerer "–" for null og undefined', () => {
    expect(formaterVarighetDager(null)).toBe('–')
    expect(formaterVarighetDager(undefined)).toBe('–')
  })

  it('formaterer timer for mindre enn 1 dag', () => {
    expect(formaterVarighetDager(0.5)).toBe('12t')
    expect(formaterVarighetDager(0.1)).toBe('2t')
  })

  it('formaterer dager', () => {
    expect(formaterVarighetDager(1)).toBe('1.0 dg')
    expect(formaterVarighetDager(5.5)).toBe('5.5 dg')
    expect(formaterVarighetDager(100.25)).toBe('100.3 dg')
  })
})

describe('formaterProsent', () => {
  it('returnerer "–" ved nevner 0', () => {
    expect(formaterProsent(5, 0)).toBe('–')
  })

  it('beregner prosent korrekt', () => {
    expect(formaterProsent(1, 2)).toBe('50.0%')
    expect(formaterProsent(1, 3)).toBe('33.3%')
    expect(formaterProsent(100, 100)).toBe('100.0%')
    expect(formaterProsent(0, 100)).toBe('0.0%')
  })
})

describe('formaterTall', () => {
  it('returnerer "–" for null og undefined', () => {
    expect(formaterTall(null)).toBe('–')
    expect(formaterTall(undefined)).toBe('–')
  })

  it('formaterer tall med nb-NO locale', () => {
    expect(formaterTall(0)).toBe('0')
    expect(formaterTall(42)).toBe('42')
    // nb-NO uses non-breaking space as thousands separator
    const result = formaterTall(1234567)
    expect(result).toContain('1')
    expect(result).toContain('234')
    expect(result).toContain('567')
  })
})

describe('formaterPeriodeLabel', () => {
  it('formaterer ISO-dato med tid', () => {
    expect(formaterPeriodeLabel('2024-12-25T14:00:00')).toBe('25.12.2024 14:00')
    expect(formaterPeriodeLabel('2024-12-25T14:30')).toBe('25.12.2024 14:30')
  })

  it('formaterer ISO-dato uten tid (dag)', () => {
    expect(formaterPeriodeLabel('2024-12-25')).toBe('25.12.2024')
  })

  it('formaterer måned (yyyy-MM)', () => {
    expect(formaterPeriodeLabel('2024-12')).toBe('12/2024')
  })

  it('formaterer kun år', () => {
    expect(formaterPeriodeLabel('2024')).toBe('2024')
  })
})

describe('formaterTimestamp', () => {
  it('formaterer ISO-tidspunkt med sekunder', () => {
    expect(formaterTimestamp('2024-12-25T14:30:45')).toBe('25.12.2024 14:30:45')
    expect(formaterTimestamp('2024-12-25T14:30:45.123')).toBe('25.12.2024 14:30:45')
  })

  it('formaterer ISO-dato uten tid', () => {
    expect(formaterTimestamp('2024-12-25')).toBe('25.12.2024')
  })

  it('returnerer input for ukjent format', () => {
    expect(formaterTimestamp('2024')).toBe('2024')
  })
})

describe('normalizePeriodToDate', () => {
  it('returnerer full dato uendret', () => {
    expect(normalizePeriodToDate('2024-06-15', 'start')).toBe('2024-06-15')
    expect(normalizePeriodToDate('2024-06-15', 'end')).toBe('2024-06-15')
  })

  it('bevarer timestamp med tid uendret', () => {
    expect(normalizePeriodToDate('2024-06-15T14:00:00', 'start')).toBe('2024-06-15T14:00:00')
    expect(normalizePeriodToDate('2024-06-15T23:59:59', 'end')).toBe('2024-06-15T23:59:59')
  })

  it('normaliserer YYYY-MM til start/slutt av måned', () => {
    expect(normalizePeriodToDate('2024-01', 'start')).toBe('2024-01-01')
    expect(normalizePeriodToDate('2024-01', 'end')).toBe('2024-01-31')
    expect(normalizePeriodToDate('2024-02', 'end')).toBe('2024-02-29') // skuddår
    expect(normalizePeriodToDate('2025-02', 'end')).toBe('2025-02-28')
    expect(normalizePeriodToDate('2024-12', 'end')).toBe('2024-12-31')
  })

  it('normaliserer YYYY til start/slutt av år', () => {
    expect(normalizePeriodToDate('2024', 'start')).toBe('2024-01-01')
    expect(normalizePeriodToDate('2024', 'end')).toBe('2024-12-31')
  })
})
