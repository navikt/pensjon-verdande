import { describe, expect, it } from 'vitest'
import { flattenForCsv, toCsv } from './LastNedTabData'

describe('flattenForCsv', () => {
  it('returnerer array direkte', () => {
    const data = [{ a: 1 }, { a: 2 }]
    expect(flattenForCsv(data)).toEqual([{ a: 1 }, { a: 2 }])
  })

  it('filtrerer null og undefined fra array', () => {
    const data = [{ a: 1 }, null, undefined, { a: 3 }]
    expect(flattenForCsv(data)).toEqual([{ a: 1 }, { a: 3 }])
  })

  it('finner første array-property i objekt', () => {
    const data = { behandlingType: 'Test', datapunkter: [{ x: 1 }, { x: 2 }] }
    expect(flattenForCsv(data)).toEqual([{ x: 1 }, { x: 2 }])
  })

  it('wrapper enkelt objekt uten arrays', () => {
    const data = { a: 1, b: 'hello' }
    expect(flattenForCsv(data)).toEqual([{ a: 1, b: 'hello' }])
  })

  it('returnerer tom array for primitiver', () => {
    expect(flattenForCsv('hello')).toEqual([])
    expect(flattenForCsv(42)).toEqual([])
    expect(flattenForCsv(null)).toEqual([])
    expect(flattenForCsv(undefined)).toEqual([])
  })

  it('returnerer tom array for tom array', () => {
    expect(flattenForCsv([])).toEqual([])
  })
})

describe('toCsv', () => {
  it('konverterer enkel array til CSV', () => {
    const data = [
      { navn: 'Alfa', antall: 10 },
      { navn: 'Beta', antall: 20 },
    ]
    const csv = toCsv(data)
    expect(csv).toBe('navn;antall\nAlfa;10\nBeta;20')
  })

  it('håndterer semikolon i verdier med escaping', () => {
    const data = [{ melding: 'feil; alvorlig' }]
    const csv = toCsv(data)
    expect(csv).toBe('melding\n"feil; alvorlig"')
  })

  it('håndterer doble anførselstegn med escaping', () => {
    const data = [{ tekst: 'sa "hei"' }]
    const csv = toCsv(data)
    expect(csv).toBe('tekst\n"sa ""hei"""')
  })

  it('håndterer linjeskift i verdier', () => {
    const data = [{ tekst: 'linje1\nlinje2' }]
    const csv = toCsv(data)
    expect(csv).toContain('"linje1\nlinje2"')
  })

  it('håndterer null-verdier som tomme strenger', () => {
    const data = [{ a: 'test', b: null }]
    const csv = toCsv(data)
    expect(csv).toBe('a;b\ntest;')
  })

  it('samler alle unike headers fra alle rader', () => {
    const data = [{ a: 1 }, { b: 2 }, { a: 3, b: 4 }]
    const csv = toCsv(data)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('a;b')
    expect(lines[1]).toBe('1;')
    expect(lines[2]).toBe(';2')
    expect(lines[3]).toBe('3;4')
  })

  it('returnerer tom streng for tomme data', () => {
    expect(toCsv([])).toBe('')
    expect(toCsv(null)).toBe('')
    expect(toCsv(undefined)).toBe('')
  })

  it('konverterer nested objekt med array-property', () => {
    const data = { type: 'test', items: [{ x: 1 }, { x: 2 }] }
    const csv = toCsv(data)
    expect(csv).toBe('x\n1\n2')
  })

  it('nøytraliserer formula injection med prefiks-tegn', () => {
    const data = [{ tekst: '=SUM(A1:A10)' }, { tekst: '+cmd' }, { tekst: '-1+1' }, { tekst: '@SUM(A1)' }]
    const csv = toCsv(data)
    const lines = csv.split('\n')
    expect(lines[1]).toBe("'=SUM(A1:A10)")
    expect(lines[2]).toBe("'+cmd")
    expect(lines[3]).toBe("'-1+1")
    expect(lines[4]).toBe("'@SUM(A1)")
  })

  it('nøytraliserer tab og CR som formula injection', () => {
    const data = [{ a: '\tcmd' }, { a: '\rcmd' }]
    const csv = toCsv(data)
    const lines = csv.split('\n')
    expect(lines[1]).toBe("'\tcmd")
    expect(lines[2]).toBe("'\rcmd")
  })

  it('beholder verdier uten farlige prefikser uendret', () => {
    const data = [{ tekst: 'Normal tekst' }, { tekst: '12345' }]
    const csv = toCsv(data)
    const lines = csv.split('\n')
    expect(lines[1]).toBe('Normal tekst')
    expect(lines[2]).toBe('12345')
  })
})
