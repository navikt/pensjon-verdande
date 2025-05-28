import { env } from '~/services/env.server'
import { StartBatchResponse } from '~/types'

export async function opprettBpen096(
  accessToken: string,
  maksAntallSekvensnummer: number,
  sekvensnummerPerBehandling: number,
  dryRun: boolean,
  debug: boolean,
): Promise<StartBatchResponse> {
  const response = await fetch(
    `${env.penUrl}/api/hentSkattehendelser`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify({
        maksAntallSekvensnummer: maksAntallSekvensnummer,
        sekvensnummerPerBehandling: sekvensnummerPerBehandling,
        dryRun: dryRun,
        debug: debug
      }),
    },
  )

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error()
  }
}
