import { data } from 'react-router'
import { env } from '~/services/env.server'

export async function oppdaterSisteGyldigOpptjeningsaar(accessToken: string, opptjeningsar: number): Promise<string> {
  const response = await fetch(`${env.penUrl}/api/opptjening/opptjeningsaar/oppdater?opptjeningsar=${opptjeningsar}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return `Siste gyldige opptjeningsår er endret til ${opptjeningsar}`
  } else {
    const text = await response.text().catch(() => '')
    throw data(`Feil ved start av oppdater siste gyldige opptjeningsår. Feil var\n${text}`, {
      status: response.status,
    })
  }
}
