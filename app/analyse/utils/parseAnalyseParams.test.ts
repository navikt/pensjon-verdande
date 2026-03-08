import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/common/date', () => ({
  toIsoDate: vi.fn((d: Date) => {
    const y = d.getFullYear()
    const m = `${d.getMonth() + 1}`.padStart(2, '0')
    const day = `${d.getDate()}`.padStart(2, '0')
    return `${y}-${m}-${day}`
  }),
}))

const { parseAnalyseParams } = await import('./parseAnalyseParams')

describe('parseAnalyseParams', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 1)) // 2026-03-01
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('bruker standardverdier når ingen parametere er oppgitt', () => {
    const request = new Request('http://localhost/analyse/test')
    const result = parseAnalyseParams(request)

    expect(result.behandlingType).toBe('FleksibelApSak')
    expect(result.aggregering).toBe('UKE')
  })

  it('leser behandlingType fra query-parameter', () => {
    const request = new Request('http://localhost/analyse/test?behandlingType=ForstegangsbehandlingBo')
    const result = parseAnalyseParams(request)

    expect(result.behandlingType).toBe('ForstegangsbehandlingBo')
  })

  it('leser aggregering fra query-parameter', () => {
    const request = new Request('http://localhost/analyse/test?aggregering=MAANED')
    const result = parseAnalyseParams(request)

    expect(result.aggregering).toBe('MAANED')
  })

  it('legger til tidsstempel på fom/tom uten T', () => {
    const request = new Request('http://localhost/analyse/test?fom=2026-01-01&tom=2026-02-28')
    const result = parseAnalyseParams(request)

    expect(result.fom).toBe('2026-01-01')
    expect(result.tom).toBe('2026-02-28')
    expect(result.params.get('fom')).toBe('2026-01-01T00:00:00.000')
    expect(result.params.get('tom')).toBe('2026-02-28T23:59:59.999')
  })

  it('beholder eksisterende tidsstempel i fom/tom', () => {
    const request = new Request('http://localhost/analyse/test?fom=2026-01-01T10:30:00.000&tom=2026-02-28T15:00:00.000')
    const result = parseAnalyseParams(request)

    expect(result.params.get('fom')).toBe('2026-01-01T10:30:00.000')
    expect(result.params.get('tom')).toBe('2026-02-28T15:00:00.000')
  })

  it('paramsAgg inneholder aggregering', () => {
    const request = new Request('http://localhost/analyse/test?aggregering=DAG&fom=2026-01-01&tom=2026-01-31')
    const result = parseAnalyseParams(request)

    expect(result.paramsAgg.get('aggregering')).toBe('DAG')
    expect(result.paramsAgg.get('fom')).toBe('2026-01-01T00:00:00.000')
  })

  it('params inneholder behandlingType', () => {
    const request = new Request('http://localhost/analyse/test?behandlingType=TestType')
    const result = parseAnalyseParams(request)

    expect(result.params.get('behandlingType')).toBe('TestType')
  })
})
