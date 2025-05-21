import { env } from '~/services/env.server'
import { StartBatchResponse } from '~/types'

export async function opprettGjpUtvidetrett(
  accessToken: string,
  dryRun: boolean,
  venteperiodeDager: number,
  sakIdFilter: number | null,
): Promise<StartBatchResponse> {
  const response = await fetch(
    `${env.penUrl}/api/gjenlevendepensjon/varsel/batch`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify({
        dryRun: dryRun,
        venteperiodeDager: venteperiodeDager,
        sakIdFilter: sakIdFilter
      }),
    },
  )

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error()
  }
}
