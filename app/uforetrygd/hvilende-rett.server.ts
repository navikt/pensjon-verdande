import { env } from '~/services/env.server'

export const opprettHvilendeRettVarselbrevBehandlinger = async (
  accessToken: string,
  senesteHvilendeAr: number,
): Promise<HvilendeRettBehandlingResponse> => {
  const response = await fetch(`${env.penUrl}/api/uforetrygd/hvilenderett/behandling/varsel/batch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      senesteHvilendeAr,
    }),
  })

  if (response.ok) {
    return (await response.json()) as HvilendeRettBehandlingResponse
  } else {
    throw new Error(`Kunne ikke opprette behandling. Statuskode: ${response.status}`)
  }
}

type HvilendeRettBehandlingResponse = {
  behandlingId: number
}
