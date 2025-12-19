import { env } from '~/services/env.server'

export async function opprettAvstemmingGrensesnittBehandling(
  accessToken: string,
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
  const response = await fetch(`${env.penUrl}/api/vedtak/avstemming/grensesnitt/start`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      penAfp: PENAFP,
      penAfpp: PENAFPP,
      penPenap: PENAP,
      penPenbp: PENBP,
      penPengj: PENGJ,
      penPengy: PENGY,
      penPenkp: PENKP,
      penPenup: PENUP,
      penUforeut: UFOREUT,
      avstemmingsperiodeStart: avstemmingsperiodeStart,
      avstemmingsperiodeEnd: avstemmingsperiodeEnd,
    }),
  })

  if (response.ok) {
    return (await response.json()) as StartAvstemmingResponse
  } else {
    throw new Error()
  }
}

type StartAvstemmingResponse = {
  behandlingIder: number[]
}
