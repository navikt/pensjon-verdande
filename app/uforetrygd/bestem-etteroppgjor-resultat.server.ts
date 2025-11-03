import { env } from '~/services/env.server'

export async function startBestemEtteroppgjorResultat(
  accessToken: string,
  ar: number | null,
  sakIds: number[],
  oppdaterSisteGyldigeEtteroppgjørsÅr: boolean,
) {
  const response = await fetch(`${env.penUrl}/api/uforetrygd/bestemetteroppgjor/start`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      sakIds: sakIds,
      ar: ar,
      oppdaterSisteGyldigeEtteroppgjørsÅr: oppdaterSisteGyldigeEtteroppgjørsÅr,
    }),
  })

  if (response.ok) {
    return (await response.json()) as Response
  } else {
    throw new Error(`Kunne ikke opprette behandling. Statuskode: ${response.status}`)
  }
}

type Response = {
  behandlingId: number
}
