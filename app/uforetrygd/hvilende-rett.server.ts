import { env } from '~/services/env.server'

export const opprettHvilendeRettVarselbrevBehandlinger = async (accessToken: string, senesteHvilendeAr: number) => {
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

  return {
    success: response.ok,
  }
}
