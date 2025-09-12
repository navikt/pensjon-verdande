import { env } from '~/services/env.server'
import type {BehandlingDto, StartBatchResponse} from '~/types'

export const opprettBehandlingSerie = async(
  accessToken: string,
  behandlingCode: string,
  regelmessighet: string,
  valgteDatoer: string[],
  startTid: string,
  opprettetAv: string,

) => {
    const planlagteKjoringer = valgteDatoer.map(d => ({
        dato: d,
        tidspunkt: startTid,
    }));
  const response = await fetch(
    `${env.penUrl}/api/behandling/serier`,
    {
      method: 'POST',
      body: JSON.stringify(
        {
            behandlingCode,
            planlagteKjoringer,
            regelmessighet,
            opprettetAv,
        }
      )
      ,
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
    throw new Error()
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
        return (await response.json()) as BehandlingDto[]
      } else {
        return []
      }
    }
