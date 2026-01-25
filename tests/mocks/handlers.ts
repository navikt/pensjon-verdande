import { http, HttpResponse } from 'msw'

/**
 * MSW request handlers for mocking pensjon-pen API  
 * These mocks allow us to test behavior without depending on backend
 */

const PEN_URL = 'http://localhost:3001'
const TOKEN_ENDPOINT = 'http://localhost:3001/oauth2/v2.0/token'

export const handlers = [
  // Mock OAuth2 token exchange (OBO flow) - Azure AD
  http.post(TOKEN_ENDPOINT, async () => {
    return HttpResponse.json({
      token_type: 'Bearer',
      scope: 'api://test/.default',
      expires_in: 3600,
      access_token: 'mock-obo-access-token-for-pen',
      refresh_token: 'mock-refresh-token',
    })
  }),

  // Mock hentMe (bruker info)
  http.get(`${PEN_URL}/api/me`, async () => {
    return HttpResponse.json({
      brukernavn: 'test.bruker',
      navn: 'Test Bruker',
      roller: ['SAKSBEHANDLER'],
    })
  }),

  // Mock scheduler status
  http.get(`${PEN_URL}/api/behandling/scheduler/status`, async () => {
    return HttpResponse.json({
      status: 'RUNNING',
    })
  }),

  // Mock hentMuligeManedligeKjoringer
  http.get(`${PEN_URL}/api/opptjening/muligeManedligeKjoringer`, async () => {
    return HttpResponse.json({
      maneder: ['2024-01', '2024-02', '2024-03', '2024-04'],
      kanOverstyre: false,
    })
  }),

  // Mock getSisteAvsjekk
  http.get(`${PEN_URL}/api/opptjening/sisteAvsjekk`, async () => {
    return HttpResponse.json({
      sisteAvsjekkTidspunkt: new Date().toISOString(),
      antallHendelserPopp: 100,
      antallHendelserPen: 100,
      avsjekkOk: true,
    })
  }),

  // Mock getBehandlinger for månedlig omregning
  http.get(`${PEN_URL}/api/behandling`, async ({ request }) => {
    const url = new URL(request.url)
    const behandlingType = url.searchParams.get('behandlingType')
    
    if (behandlingType === 'OpptjeningIdentifiserKategoriManedlig') {
      return HttpResponse.json({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 12,
        number: 0,
      })
    }
    
    return HttpResponse.json({ content: [], totalElements: 0 })
  }),

  // Mock opprett månedlig omregning
  http.post(`${PEN_URL}/api/opptjening/mandeliguttrekk/opprett`, async () => {
    return HttpResponse.json({
      behandlingId: 12345,
    }, { status: 201 })
  }),

  // Mock opprett avsjekk
  http.post(`${PEN_URL}/api/opptjening/avsjekk`, async () => {
    return HttpResponse.json({}, { status: 200 })
  }),

  // Mock behandling details
  http.get(`${PEN_URL}/api/behandling/:behandlingId`, async ({ params }) => {
    const { behandlingId } = params
    return HttpResponse.json({
      behandlingId: Number(behandlingId),
      status: 'OPPRETTET',
      type: 'OpptjeningIdentifiserKategoriManedlig',
      opprettetTidspunkt: new Date().toISOString(),
    })
  }),
]


