import { apiGet, apiGetOrUndefined, apiPost } from '~/services/api.server'

export async function opprettOpptjeningsendringMandeligOmregning(
  request: Request,
  behandlingsmaned: number,
  kjoeretidspunkt: string,
  avsjekkForKjoring: boolean,
): Promise<StartBatchResponse> {
  const result = await apiPost<StartBatchResponse>('/api/opptjening/mandeliguttrekk/opprett', {
    behandlingsmaned,
    kjoeretidspunkt,
    avsjekkForKjoring,
  }, request)
  return result as StartBatchResponse
}

export async function hentMuligeManedligeKjoringer(request: Request): Promise<MuligeManedligeKjoringerResponse> {
  return apiGet<MuligeManedligeKjoringerResponse>('/api/opptjening/muligeManedligeKjoringer', request)
}

export async function getSisteAvsjekk(request: Request): Promise<SisteAvsjekkResponse | null> {
  const result = await apiGetOrUndefined<SisteAvsjekkResponse>('/api/opptjening/sisteAvsjekk', request)
  return result ?? null
}

export const opprettAvsjekk = async (request: Request) => {
  await apiPost('/api/opptjening/avsjekk', {}, request)
}

export type SisteAvsjekkResponse = {
  sisteAvsjekkTidspunkt: string
  antallHendelserPopp: bigint
  antallHendelserPen: bigint
  avsjekkOk: boolean
}

export type MuligeManedligeKjoringerResponse = {
  maneder: string[]
  kanOverstyre: boolean
}

type StartBatchResponse = {
  behandlingId: number
}
