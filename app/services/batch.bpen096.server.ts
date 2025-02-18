import { env } from '~/services/env.server'
import { StartBatchResponse } from '~/types'

export async function opprettBpen096(
  accessToken: string,
  maksAntallSekvensnummer: number,
  sekvensnummerPerAktivitet: number,
  dryRun: boolean,
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
        sekvensnummerPerAktivitet: sekvensnummerPerAktivitet,
        dryRun: dryRun,
      }),
    },
  )

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error()
  }
}
