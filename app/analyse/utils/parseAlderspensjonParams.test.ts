import { describe, expect, it } from 'vitest'
import { parseAlderspensjonParams } from './parseAlderspensjonParams'

const req = (qs: string) => new Request(`http://x/?${qs}`)

describe('parseAlderspensjonParams', () => {
  it('beholder rekkefølge når fom < tom', () => {
    const { fom, tom } = parseAlderspensjonParams(req('fom=2024-01-01&tom=2024-06-01'))
    expect(fom).toBe('2024-01-01')
    expect(tom).toBe('2024-06-01')
  })

  it('bytter fom/tom når fom > tom (rene datoer)', () => {
    const { fom, tom } = parseAlderspensjonParams(req('fom=2024-06-01&tom=2024-01-01'))
    expect(fom).toBe('2024-01-01')
    expect(tom).toBe('2024-06-01')
  })

  it('bytter ikke når fom (med tid) er senere på samme dag som tom (dato)', () => {
    // Tidligere bug: leksikografisk swap byttet disse selv om fom < tom kronologisk
    const { fom, tom } = parseAlderspensjonParams(req('fom=2024-01-10T12:00:00.000&tom=2024-01-10'))
    // Etter normalisering: tom=2024-01-10T23:59:59.999 > fom=2024-01-10T12:00:00.000 → ingen swap
    expect(fom).toBe('2024-01-10T12:00:00.000')
    expect(tom).toBe('2024-01-10')
  })

  it('faller tilbake til MAANED ved ugyldig aggregering', () => {
    const { aggregering } = parseAlderspensjonParams(req('aggregering=MINUTT'))
    expect(aggregering).toBe('MAANED')
  })

  it('aksepterer gyldig aggregering', () => {
    const { aggregering } = parseAlderspensjonParams(req('aggregering=KVARTAL'))
    expect(aggregering).toBe('KVARTAL')
  })

  it('bygger paramsAgg med utvidet timestamp for rene datoer', () => {
    const { paramsAgg } = parseAlderspensjonParams(req('fom=2024-01-01&tom=2024-06-01'))
    expect(paramsAgg.get('fom')).toBe('2024-01-01T00:00:00.000')
    expect(paramsAgg.get('tom')).toBe('2024-06-01T23:59:59.999')
    expect(paramsAgg.get('aggregering')).toBe('MAANED')
  })
})
