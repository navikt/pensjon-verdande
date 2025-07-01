import { env } from '~/services/env.server'
import { StartEtteroppgjorResponse } from '~/routes/afp-etteroppgjor/types'
import { data } from 'react-router'

export async function startAfpEtteroppgjor(
  accessToken: string,
  {
    kjøreår,
  }: {
    kjøreår: number,
  }
): Promise<StartEtteroppgjorResponse> {
  const response = await fetch(
    `${env.penUrl}/api/afpoffentlig/etteroppgjor/behandling/start`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify({
        kjorear: kjøreår,
      }),
    },
  )

  if (response.ok) {
    return (await response.json()) as StartEtteroppgjorResponse
  } else {
    let text = await response.text()
    throw data("Feil ved start av AFP Etteroppgjør. Feil var\n" + text, {
      status: response.status
    })
  }
}

