import { env } from '~/services/env.server'
import type {BehandlingDto, BehandlingSerieDTO, StartBatchResponse} from '~/types'

export const opprettBehandlingSerie = async(
  accessToken: string,
  behandlingCode: string,
  regelmessighet: string,
  valgteDatoer: string[],
  startTid: string,
  opprettetAv: string,
) => {
    const planlagteKjoringer = valgteDatoer.map(d =>
        `${d}T${startTid}:00`
    );

    const body = {
            behandlingCode: behandlingCode,
            planlagteKjoringer: planlagteKjoringer,
            regelmessighet: regelmessighet,
            opprettetAv: opprettetAv,
        }

    console.log('Request body:', body); // Log the request body for debugging

  const response = await fetch(
    `${env.penUrl}/api/behandling/serier`,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as string
  } else {
    throw new Error(`Failed to create behandling serie: ${response.status} ${response.statusText}`)
  }
}

export const getBehandlingSerier = async (
    accessToken: string,
    behandlingType: string,
) => {
    const response = await fetch(
        `${env.penUrl}/api/behandling/serier?behandlingCode=${behandlingType}`,
        { method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Request-ID': crypto.randomUUID(),
          },
        },
      )

      if (response.ok) {
        return (await response.json()) as BehandlingSerieDTO[]
      } else {
        return []
      }
    }
