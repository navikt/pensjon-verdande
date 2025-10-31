import type { BprofUttrekk } from '~/adhocbrev_fullmakter/adhoc-brev-fullmakt.types'
import { env } from '~/services/env.server'

export async function opprettAdHocBrevSlettFullmaktBprofBehandling(
  accessToken: string,
  uttrekk: BprofUttrekk,
): Promise<StartBatchResponse> {
  const response = await fetch(`${env.penUrl}/api/behandling/adhocBrevSlettFullmaktBprof/createBehandling`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify(uttrekk),
  })

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error(await response.text())
  }
}

type StartBatchResponse = {
  behandlingId: number
}
