import { describe, expect, test } from 'vitest'
import { decodeStyringHandling } from '~/common/decode'

describe('decodeStyringHandling', () => {
  test('dekoder AKTIVER', () => {
    expect(decodeStyringHandling('AKTIVER')).toBe('Aktivert')
  })

  test('dekoder DEAKTIVER', () => {
    expect(decodeStyringHandling('DEAKTIVER')).toBe('Deaktivert')
  })

  test('dekoder ENDRE_MAKS_SAMTIDIGE', () => {
    expect(decodeStyringHandling('ENDRE_MAKS_SAMTIDIGE')).toBe('Endret maks samtidige')
  })

  test('dekoder NULLSTILL', () => {
    expect(decodeStyringHandling('NULLSTILL')).toBe('Nullstilt')
  })

  test('faller tilbake til rå verdi for ukjent handling', () => {
    expect(decodeStyringHandling('UKJENT_HANDLING')).toBe('UKJENT_HANDLING')
  })
})
