import { http, HttpResponse } from 'msw'

/**
 * MSW request handlers for mocking pensjon-pen API
 * These mocks allow us to test behavior without depending on backend
 */

const BASE_URL = process.env.VITE_PEN_URL || 'http://localhost:8080'

export const handlers = [
  // Mock opptjening månedlig omregning
  http.post(`${BASE_URL}/api/opptjening/manedlig-omregning`, async () => {
    return HttpResponse.json({
      behandlingId: 12345,
      status: 'OPPRETTET',
    }, { status: 201 })
  }),

  // Mock behandling details
  http.get(`${BASE_URL}/api/behandling/:behandlingId`, async ({ params }) => {
    const { behandlingId } = params
    return HttpResponse.json({
      behandlingId: Number(behandlingId),
      status: 'OPPRETTET',
      type: 'MANEDLIG_OMREGNING',
      opprettetTidspunkt: new Date().toISOString(),
    })
  }),

  // Mock error scenario
  http.post(`${BASE_URL}/api/opptjening/manedlig-omregning-error`, async () => {
    return HttpResponse.json({
      message: 'Backend feil',
    }, { status: 500 })
  }),
]
