import { env } from '~/services/env.server'

export async function opprettBpen090(
  accessToken: string,
  kjoremaaned: number,
  begrensUtplukk: boolean,
  dryRun: boolean,
  prioritet: number,
): Promise<StartBatchResponse> {
  const response = await fetch(`${env.penUrl}/api/uforetrygd/lopendeinntektsavkorting/batch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      kjoremaaned: kjoremaaned,
      begrensUtplukk: begrensUtplukk,
      dryRun: dryRun,
      prioritet: prioritet,
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
