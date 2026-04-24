import { describe, expect, it } from 'vitest'
import { formaterBucketLabel, tidsdimensjonLabel } from './formatters'

describe('formaterBucketLabel', () => {
  it('formaterer DAG', () => {
    expect(formaterBucketLabel('2026-03-15T00:00:00', 'DAG')).toBe('15. mar 2026')
  })
  it('formaterer MAANED', () => {
    expect(formaterBucketLabel('2026-03-01T00:00:00', 'MAANED')).toBe('mar 2026')
  })
  it('formaterer KVARTAL', () => {
    expect(formaterBucketLabel('2026-04-01T00:00:00', 'KVARTAL')).toBe('Q2 2026')
    expect(formaterBucketLabel('2026-01-01T00:00:00', 'KVARTAL')).toBe('Q1 2026')
    expect(formaterBucketLabel('2026-12-01T00:00:00', 'KVARTAL')).toBe('Q4 2026')
  })
  it('formaterer AAR', () => {
    expect(formaterBucketLabel('2026-01-01T00:00:00', 'AAR')).toBe('2026')
  })
  it('returnerer rå streng for ugyldig input', () => {
    expect(formaterBucketLabel('ikke-en-dato', 'MAANED')).toBe('ikke-en-dato')
  })
})

describe('tidsdimensjonLabel', () => {
  it('mapper kjente verdier', () => {
    expect(tidsdimensjonLabel('OPPRETTET')).toBe('opprettet')
    expect(tidsdimensjonLabel('SISTE_KJORING')).toBe('sist kjørt')
  })
})
