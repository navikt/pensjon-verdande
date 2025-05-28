import { env } from '~/services/env.server'
import { StartBatchResponse } from '~/types'

export async function opprettBpen014(
  accessToken: string,
  aar: number,
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
      }),
    },
  )

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error()
  }
}
