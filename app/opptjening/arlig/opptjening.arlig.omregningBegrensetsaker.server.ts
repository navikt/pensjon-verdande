import { data } from 'react-router'
import { env } from '~/services/env.server'

export async function opprettOpptjeningsendringArligOmregningBegrensetsaker(
  accessToken: string,
  opptjeningsar: number,
): Promise<StartBatchResponse> {
  const response = await fetch(`${env.penUrl}/api/opptjening/arligendring/opprettbegrensetsaker`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      opptjeningsar: opptjeningsar,
      bolkstorrelse: 10000,
    }),
  })

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    const text = await response.text()
    throw data(`Feil ved start av årlig omregning. Feil var\n${text}`, {
      status: response.status,
    })
  }
}

type StartBatchResponse = {
  behandlingId: number
  bolkstorrelse: number
}
