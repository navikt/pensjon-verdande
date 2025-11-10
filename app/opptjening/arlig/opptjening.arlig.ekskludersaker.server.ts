import { data } from 'react-router'
import type { EkskluderteSakerResponse, EkskludertSak } from '~/opptjening/arlig/opptjening.types'
import { env } from '~/services/env.server'

export async function hentEkskluderSakerFraArligOmregning(accessToken: string): Promise<EkskludertSak[]> {
  const response = await fetch(`${env.penUrl}/api/opptjening/eksludertesaker`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return ((await response.json()) as EkskluderteSakerResponse).ekskluderteSaker
  } else {
    const text = await response.text()
    throw data(`Feil ved start av årlig omregning. Feil var\n${text}`, {
      status: response.status,
    })
  }
}

export async function ekskluderSakerFraArligOmregning(
  accessToken: string,
  sakIder: string[],
  kommentar: string | undefined,
): Promise<void> {
  const response = await fetch(`${env.penUrl}/api/opptjening/eksludertesaker/leggTil`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      sakIder: sakIder,
      kommentar: kommentar,
    }),
  })

  if (response.ok) {
    return
  } else {
    const text = await response.text()
    throw data(`Feil ved start av årlig omregning. Feil var\n${text}`, {
      status: response.status,
    })
  }
}
