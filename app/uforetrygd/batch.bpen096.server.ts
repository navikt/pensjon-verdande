import { apiGet, apiPost } from '~/services/api.server'

export async function opprettBpen096(
  request: Request,
  maksAntallSekvensnummer: number,
  sekvensnummerPerBehandling: number,
  debug: boolean,
): Promise<StartBatchResponse> {
  const result = await apiPost<StartBatchResponse>('/api/uforetrygd/etteroppgjor/skattehendelser', {
    maksAntallSekvensnummer,
    sekvensnummerPerBehandling,
    debug,
  }, request)
  return result as StartBatchResponse
}

export async function hentSkattehendelserManuelt(
  sekvensnr: number[],
  request: Request,
): Promise<HentSkattehendelserManueltResponse> {
  const result = await apiPost<HentSkattehendelserManueltResponse>(
    '/api/uforetrygd/etteroppgjor/skattehendelser/kjor-hendelser-manuelt',
    { sekvensnummer: sekvensnr },
    request,
  )
  return result as HentSkattehendelserManueltResponse
}

export async function hentAntallSkattehendelser(request: Request): Promise<HentAntallSkattehendelserResponse> {
  return apiGet<HentAntallSkattehendelserResponse>('/api/uforetrygd/etteroppgjor/skattehendelser/antall', request)
}

type StartBatchResponse = {
  behandlingId: number
}

type HentSkattehendelserManueltResponse = {
  behandlingIder: number[]
}

type HentAntallSkattehendelserResponse = {
  antall: number
}
