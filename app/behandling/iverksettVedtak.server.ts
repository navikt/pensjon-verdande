import { env } from '~/services/env.server'
import { data } from 'react-router'

export async function sendTilOppdragPaNytt(
  accessToken: string,
  behandlingId: string,
): Promise<void> {
  const response = await fetch(
    `${env.penUrl}/api/vedtak/iverksett/${behandlingId}/sendtiloppdragpanytt`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    const text = await response.text()
    throw data(`Feil ved sending til oppdrag på nytt. Feil var\n${text}`, {
      status: response.status
    })
  }
}
