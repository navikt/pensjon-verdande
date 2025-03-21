import { env } from '~/services/env.server'
import type { StartBatchResponse } from '~/types'

export async function opprettBpen005(
  accessToken: string,
  behandlingsmaned: number,
  begrensetUtplukk: boolean,
): Promise<StartBatchResponse> {
  const response = await fetch(
    `${env.penUrl}/api/aldersovergang/utplukk`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify({
        behandlingsmaned: behandlingsmaned,
        begrensetUtplukk: begrensetUtplukk,
      }),
    },
  )

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error()
  }
}

