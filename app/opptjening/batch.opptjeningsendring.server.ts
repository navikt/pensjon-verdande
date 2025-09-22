import { env } from '~/services/env.server'

export async function opprettOpptjeningsendring(
  accessToken: string,
  behandlingsmaned: number,
): Promise<StartBatchResponse> {
  const response = await fetch(`${env.penUrl}/api/opptjening/kategoriserbruker/opprett`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      behandlingsmaned: behandlingsmaned,
    }),
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
