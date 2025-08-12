import { env } from '~/services/env.server'
import { StartBatchResponse } from '~/types'

export async function opprettBpen014(
  accessToken: string,
  aar: number,
  eps2g : boolean,
  gjenlevende : boolean,
  opprettOppgave : boolean,
): Promise<StartBatchResponse> {
  const response = await fetch(
    `${env.penUrl}/pen/api/inntektskontroll/opprett`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify({
        aar: aar,
        eps2g: eps2g,
        gjenlevende: gjenlevende,
        opprettOppgave : opprettOppgave
      }),
    },
  )

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error()
  }
}
