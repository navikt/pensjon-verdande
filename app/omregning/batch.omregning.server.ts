import { apiGet, apiGetRawStringOrUndefined, apiPost } from '~/services/api.server'
import type {
  OmregningBehandlingsnoekler,
  OmregningInit,
  OmregningInput,
  OmregningRequest,
  OmregningSakerPage,
  OmregningStatistikkPage,
} from '~/types'

type StartBatchResponse = {
  behandlingId: number
}

export async function opprettOmregningbehandling(
  request: Request,
  payload: OmregningRequest,
): Promise<StartBatchResponse> {
  const response = await apiPost<StartBatchResponse>('/api/behandling/omregning/opprett', payload, request)
  return response!
}

export async function hentOmregningInit(request: Request): Promise<OmregningInit> {
  return await apiGet<OmregningInit>('/api/behandling/omregning/init', request)
}

export async function hentOmregningInput(request: Request, page: number, size: number): Promise<OmregningSakerPage> {
  return await apiGet<OmregningSakerPage>(`/api/behandling/omregning/input?page=${page}&size=${size}`, request)
}

export async function oppdaterOmregningInput(request: Request, body: { saker: number[] }): Promise<OmregningInput> {
  const response = await apiPost<OmregningInput>('/api/behandling/omregning/input', body, request)
  return response!
}

export async function hentOmregningbehandlingsnokler(request: Request): Promise<OmregningBehandlingsnoekler> {
  return await apiGet<OmregningBehandlingsnoekler>(
    '/api/behandling/omregning/statistikk/behandlingsnoekler',
    request,
  )
}

export async function hentOmregningStatistikk(
  request: Request,
  behandlingsnoekkel: string,
  page: number,
  size: number,
): Promise<OmregningStatistikkPage> {
  const response = await apiPost<OmregningStatistikkPage>(
    `/api/behandling/omregning/statistikk?behandlingsnoekkel=${behandlingsnoekkel}&page=${page}&size=${size}`,
    undefined,
    request,
  )
  return response!
}

export async function hentOmregningStatistikkCsv(request: Request, behandlingsnoekkel: string): Promise<string> {
  const result = await apiGetRawStringOrUndefined(
    `/api/behandling/omregning/statistikk/csv?behandlingsnoekkel=${behandlingsnoekkel}`,
    request,
  )
  return result!
}
