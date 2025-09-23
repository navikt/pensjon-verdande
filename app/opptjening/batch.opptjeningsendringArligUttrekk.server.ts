import { env } from '~/services/env.server'

export async function opprettOpptjeningsendringArligUttrekk(accessToken: string): Promise<StartBatchResponse> {
  const response = await fetch(`${env.penUrl}/api/opptjening/arliguttrekk/opprett`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error()
  }
}

type StartBatchResponse = {
  behandlingId: number
}
