import { beforeEach, describe, expect, it, vi } from 'vitest'

const { apiPost, getBehandling } = vi.hoisted(() => ({ apiPost: vi.fn(), getBehandling: vi.fn() }))

vi.mock('~/services/api.server', () => ({ apiPost }))
vi.mock('~/services/behandling.server', () => ({ getBehandling }))

const { action, loader } = await import('./send-behandlinger-til-manuell')

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
    pattern: '/api/send-behandlinger-til-manuell',
  }) as Parameters<typeof action>[0]

const loaderArgs = (request: Request) =>
  ({
    request,
    url: new URL(request.url),
    params: {},
    context: {},
    pattern: '/api/send-behandlinger-til-manuell',
  }) as Parameters<typeof loader>[0]

function requestWith(behandlingIder: string, oppgavetekst: string) {
  const formData = new FormData()
  formData.set('behandlingIder', behandlingIder)
  formData.set('modus', 'egendefinert')
  formData.set('oppgavetekst', oppgavetekst)
  return new Request('http://localhost/api/send-behandlinger-til-manuell', { method: 'POST', body: formData })
}

describe('send-behandlinger-til-manuell', () => {
  beforeEach(() => {
    apiPost.mockReset()
    getBehandling.mockReset()
  })

  it('sender valgte behandlinger og trimmet oppgavetekst til backend', async () => {
    getBehandling.mockResolvedValue({
      _links: { sendTilManuellMedKontrollpunkt: { href: '/manuell', type: 'PUT' } },
      muligeKontrollpunkt: [],
    })
    const formData = new FormData()
    formData.set('behandlingIder', '[12, 12, 13]')
    formData.set('modus', 'egendefinert')
    formData.set('oppgavetekst', '  Følg opp saken  ')
    const request = new Request('http://localhost/api/send-behandlinger-til-manuell', {
      method: 'POST',
      body: formData,
    })
    const result = await action(actionArgs(request))

    expect(apiPost).toHaveBeenCalledOnce()
    expect(apiPost).toHaveBeenCalledWith(
      '/api/behandling/opprett-oppgaver',
      { behandlingIder: [12, 13], oppgavetekst: 'Følg opp saken' },
      request,
    )
    expect(result).toEqual({ success: true, antall: 2 })
  })

  it('avviser ugyldige behandlingsider uten backend-kall', async () => {
    const result = await action(actionArgs(requestWith('[12, "13"]', 'Tekst')))

    expect(result).toEqual({ success: false, error: 'Velg minst én gyldig behandling.' })
    expect(apiPost).not.toHaveBeenCalled()
  })

  it('avviser tom oppgavetekst uten backend-kall', async () => {
    const formData = new FormData()
    formData.set('behandlingIder', '[12]')
    formData.set('modus', 'egendefinert')
    formData.set('oppgavetekst', '   ')
    const request = new Request('http://localhost/api/send-behandlinger-til-manuell', {
      method: 'POST',
      body: formData,
    })
    const result = await action(actionArgs(request))

    expect(result).toEqual({ success: false, error: 'Skriv inn oppgavetekst.' })
    expect(apiPost).not.toHaveBeenCalled()
  })

  it('sender valgt kontrollpunkt til backend', async () => {
    getBehandling.mockResolvedValue({
      _links: { sendTilManuellMedKontrollpunkt: { href: '/manuell', type: 'PUT' } },
      muligeKontrollpunkt: [{ kontrollpunkt: 'KP001', decode: 'Kontroller inntektsgrunnlag' }],
    })
    const formData = new FormData()
    formData.set('behandlingIder', '[12]')
    formData.set('modus', 'kontrollpunkt')
    formData.set('kontrollpunkt', 'KP001')
    const request = new Request('http://localhost/api/send-behandlinger-til-manuell', {
      method: 'POST',
      body: formData,
    })

    const result = await action(actionArgs(request))

    expect(apiPost).toHaveBeenCalledWith(
      '/api/behandling/opprett-oppgaver',
      { behandlingIder: [12], kontrollpunkt: 'KP001' },
      request,
    )
    expect(result).toEqual({ success: true, antall: 1 })
  })

  it('avviser kontrollpunkt som ikke gjelder for alle behandlinger', async () => {
    getBehandling.mockImplementation(async (_request: Request, id: string) => ({
      _links: { sendTilManuellMedKontrollpunkt: { href: '/manuell', type: 'PUT' } },
      muligeKontrollpunkt: id === '12' ? [{ kontrollpunkt: 'KP001', decode: 'Kontroller' }] : [],
    }))
    const formData = new FormData()
    formData.set('behandlingIder', '[12, 13]')
    formData.set('modus', 'kontrollpunkt')
    formData.set('kontrollpunkt', 'KP001')
    const request = new Request('http://localhost/api/send-behandlinger-til-manuell', {
      method: 'POST',
      body: formData,
    })

    const result = await action(actionArgs(request))

    expect(result).toEqual({
      success: false,
      error: 'Kontrollpunktet kan ikke brukes på alle valgte behandlinger.',
    })
    expect(apiPost).not.toHaveBeenCalled()
  })

  it('sjekker mulighet for manuell behandling fra behandlingsdetaljenes HAL-lenker', async () => {
    getBehandling.mockImplementation(async (_request: Request, id: string) => ({
      behandlingId: Number(id),
      _links: Number(id) === 12 ? { sendTilManuellMedKontrollpunkt: { href: '/manuell', type: 'PUT' } } : {},
      muligeKontrollpunkt: [
        { kontrollpunkt: 'KP001', decode: 'Kontroller inntektsgrunnlag' },
        ...(id === '12' ? [{ kontrollpunkt: 'KP002', decode: 'Kontroller trygdetid' }] : []),
      ],
    }))
    const request = new Request('http://localhost/api/send-behandlinger-til-manuell?behandlingId=12&behandlingId=13')

    const result = await loader(loaderArgs(request))

    expect(getBehandling).toHaveBeenCalledTimes(2)
    expect(result).toEqual({
      behandlingIder: [12, 13],
      kanSendesTilManuell: [12],
      kontrollpunkter: [{ kontrollpunkt: 'KP001', decode: 'Kontroller inntektsgrunnlag' }],
    })
  })
})
