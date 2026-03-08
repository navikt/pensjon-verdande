import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { AnalyseErrorAlert } from './AnalyseErrorAlert'

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useRevalidator: () => ({ state: 'idle', revalidate: vi.fn() }),
  }
})

function makeRouteError(status: number, data: unknown) {
  return {
    status,
    statusText: 'Error',
    data,
    internal: false,
  }
}

describe('AnalyseErrorAlert', () => {
  it('viser timeout-melding for 504-feil', () => {
    const error = makeRouteError(504, 'Gateway Timeout')
    const html = renderToStaticMarkup(<AnalyseErrorAlert error={error} label="varighet" />)

    expect(html).toContain('Analysen tok for lang tid')
    expect(html).toContain('kortere tidsperiode')
  })

  it('viser timeout-melding for 408-feil', () => {
    const error = makeRouteError(408, 'Request Timeout')
    const html = renderToStaticMarkup(<AnalyseErrorAlert error={error} label="varighet" />)

    expect(html).toContain('Analysen tok for lang tid')
  })

  it('viser retry-knapp ved timeout', () => {
    const error = makeRouteError(504, 'Gateway Timeout')
    const html = renderToStaticMarkup(<AnalyseErrorAlert error={error} label="varighet" />)

    expect(html).toContain('Prøv igjen')
  })

  it('viser generisk feilmelding for andre HTTP-feil', () => {
    const error = makeRouteError(500, 'Internal Server Error')
    const html = renderToStaticMarkup(<AnalyseErrorAlert error={error} label="kontrollpunkter" />)

    expect(html).toContain('Kunne ikke laste kontrollpunkter')
    expect(html).toContain('500')
    expect(html).toContain('Internal Server Error')
  })

  it('viser retry-knapp ved generisk feil', () => {
    const error = makeRouteError(500, 'Internal Server Error')
    const html = renderToStaticMarkup(<AnalyseErrorAlert error={error} label="test" />)

    expect(html).toContain('Prøv igjen')
  })

  it('håndterer objekt-data i feilrespons', () => {
    const error = makeRouteError(400, { message: 'Bad request details' })
    const html = renderToStaticMarkup(<AnalyseErrorAlert error={error} label="test" />)

    expect(html).toContain('Bad request details')
    expect(html).not.toContain('[object Object]')
  })

  it('håndterer ikke-RouteErrorResponse-feil', () => {
    const error = new Error('Nettverksfeil')
    const html = renderToStaticMarkup(<AnalyseErrorAlert error={error} label="tidsserie" />)

    expect(html).toContain('Kunne ikke laste tidsserie')
    expect(html).toContain('Nettverksfeil')
  })

  it('håndterer string-feil', () => {
    const html = renderToStaticMarkup(<AnalyseErrorAlert error="ukjent feil" label="test" />)

    expect(html).toContain('ukjent feil')
  })
})
