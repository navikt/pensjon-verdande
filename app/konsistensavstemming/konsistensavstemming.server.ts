import { apiPost } from '~/services/api.server'

export async function opprettKonsistensavstemmingBehandling(
  request: Request,
  PENAFP: boolean,
  PENAFPP: boolean,
  PENAP: boolean,
  PENBP: boolean,
  PENFP: boolean,
  PENGJ: boolean,
  PENGY: boolean,
  PENKP: boolean,
  UFOREUT: boolean,
  avstemmingsdato: string,
): Promise<StartKonsistensavstemmingResponse> {
  const response = await apiPost<StartKonsistensavstemmingResponse>(
    '/api/vedtak/avstemming/konsistens/start',
    {
      penAfp: PENAFP,
      penAfpp: PENAFPP,
      penPenap: PENAP,
      penPenbp: PENBP,
      penPenfp: PENFP,
      penPengj: PENGJ,
      penPengy: PENGY,
      penPenkp: PENKP,
      penUforeut: UFOREUT,
      avstemmingsdato,
    },
    request,
  )
  return response!
}

type StartKonsistensavstemmingResponse = {
  behandlingIder: number[]
}
