import { env } from '~/services/env.server'

export async function opprettAvstemmingGrensesnittBehandling(
  accessToken: string,
  underkomponentKode: string,
  avstemmingsperiodeStart: string,
  avstemmingsperiodeEnd: string,
): Promise<StartAvstemmingResponse> {
  const body = {
    underkomponentKode: underkomponentKode,
    avstemmingsperiodeStart: avstemmingsperiodeStart,
    avstemmingsperiodeEnd: avstemmingsperiodeEnd,
  }

  const response = await fetch(`${env.penUrl}/api/avstemming/grensesnitt/start`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  })

  if (response.ok) {
    return (await response.json()) as StartAvstemmingResponse
  } else {
    throw new Error()
  }
}

type StartAvstemmingResponse = {
  behandlingId: number
}
