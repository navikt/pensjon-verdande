import { env } from '~/services/env.server'
import type { StartBatchResponse } from '~/types'

export async function opprettBpen055MandeligUttrekk(
  accessToken: string,
  behandlingsmaned: number,
): Promise<StartBatchResponse> {
  const response = await fetch(
    `${env.penUrl}/api/opptjening/mandeliguttrekk/opprett`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify({
        behandlingsmaned: behandlingsmaned,
      }),
    },
  )

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error()
  }
}

