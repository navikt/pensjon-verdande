import { env } from '~/services/env.server'
import { StartBatchResponse } from '~/types'

export async function opprettBpen007(
  accessToken: string,
  beregningsAr: number,
): Promise<StartBatchResponse> {
  const response = await fetch(
    `${env.penUrl}/api/samboer/vurder-samboere/batch`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify({
        beregningsAr: beregningsAr,
      }),
    },
  )

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error()
  }
}
