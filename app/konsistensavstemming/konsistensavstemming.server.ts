import { env } from '~/services/env.server'

export async function opprettKonsistensavstemmingBehandling(
  accessToken: string,
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
  const response = await fetch(`${env.penUrl}/api/vedtak/avstemming/konsistens/start`, {
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
      penPenfp: PENFP,
      penPengj: PENGJ,
      penPengy: PENGY,
      penPenkp: PENKP,
      penUforeut: UFOREUT,
      avstemmingsdato: avstemmingsdato,
    }),
  })

  if (response.ok) {
    return (await response.json()) as StartKonsistensavstemmingResponse
  } else {
    throw new Error()
  }
}

type StartKonsistensavstemmingResponse = {
  behandlingIder: number[]
}
