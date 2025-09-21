import { env } from '~/services/env.server'
import type { StartBatchResponse } from '~/types'

export const opprettOppdaterSakBehandlingPEN = async (accessToken: string, startDato: string) => {
  const response = await fetch(`${env.penUrl}/api/oppdatersakstatus/behandling`, {
    method: 'POST',
    body: JSON.stringify({
      startDato,
    }),
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
