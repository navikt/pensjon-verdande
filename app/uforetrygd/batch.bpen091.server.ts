import { env } from '~/services/env.server'

export async function opprettBpen091(
  accessToken: string,
  beregningsAr: number,
  begrensUtplukk: boolean,
  dryRun: boolean,
): Promise<StartBatchResponse> {
  const response = await fetch(`${env.penUrl}/api/uforetrygd/fastsettforventetinntekt/batch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      beregningsAr: beregningsAr,
      begrensUtplukk: begrensUtplukk,
      dryRun: dryRun,
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
