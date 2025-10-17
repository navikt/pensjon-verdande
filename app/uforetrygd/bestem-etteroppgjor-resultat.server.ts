import { env } from '~/services/env.server'

export async function startBestemEtteroppgjorResultat(
  accessToken: string,
  dryRun: boolean,
  ar: number | null,
  sakIds: number[],
) {
  return await fetch(`${env.penUrl}/api/uforetrygd/bestemetteroppgjor/start`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      dryRun: dryRun,
      sakIds: sakIds,
      ar: ar,
    }),
  })
}
