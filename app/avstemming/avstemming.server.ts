import { apiPost } from '~/services/api.server'

export async function opprettAvstemmingGrensesnittBehandling(
  request: Request,
  PENAFP: boolean,
  PENAFPP: boolean,
  PENAP: boolean,
  PENBP: boolean,
  PENGJ: boolean,
  PENGY: boolean,
  PENKP: boolean,
  PENUP: boolean,
  UFOREUT: boolean,
  avstemmingsperiodeStart: string,
  avstemmingsperiodeEnd: string,
): Promise<StartAvstemmingResponse> {
  const response = await apiPost<StartAvstemmingResponse>('/api/vedtak/avstemming/grensesnitt/start', {
    penAfp: PENAFP,
    penAfpp: PENAFPP,
    penPenap: PENAP,
    penPenbp: PENBP,
    penPengj: PENGJ,
    penPengy: PENGY,
    penPenkp: PENKP,
    penPenup: PENUP,
    penUforeut: UFOREUT,
    avstemmingsperiodeStart,
    avstemmingsperiodeEnd,
  }, request)
  return response!
}

type StartAvstemmingResponse = {
  behandlingIder: number[]
}
