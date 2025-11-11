import { data } from 'react-router'
import { env } from '~/services/env.server'

export async function oppdaterSisteOmsorgGodskrivingsaar(
  accessToken: string,
  godskrivingsaar: number,
): Promise<string> {
  const response = await fetch(
    `${env.penUrl}/api/opptjening/omsorggodskrivingsaar/oppdater?godskrivingsaar=${godskrivingsaar}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return `Siste omsorg godskrivår er endret til ${godskrivingsaar}`
  } else {
    const text = await response.text().catch(() => '')
    throw data(`Feil ved start av oppdater siste omsorg godskrivår. Feil var\n${text}`, {
      status: response.status,
    })
  }
}
