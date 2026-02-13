import { apiGet, apiPost } from '~/services/api.server'

export async function opprettAldersovergang(
  request: Request,
  behandlingsmaned: number,
  kjoeretidspunkt: string,
  begrensetUtplukk: boolean,
): Promise<StartBatchResponse> {
  const response = await apiPost<StartBatchResponse>('/api/aldersovergang/utplukk', {
    behandlingsmaned,
    kjoeretidspunkt,
    begrensetUtplukk,
  }, request)
  return response!
}

export async function hentMuligeAldersoverganger(request: Request): Promise<MuligeAldersovergangerResponse> {
  const response = await apiGet<MuligeAldersovergangerResponse>(
    '/api/aldersovergang/muligeAldersoverganger',
    request,
  )
  return response
}

export type MuligeAldersovergangerResponse = {
  maneder: string[]
  erBegrensUtplukkLovlig: boolean
  kanOverstyreBehandlingsmaned: boolean
}

type StartBatchResponse = {
  behandlingId: number
}
