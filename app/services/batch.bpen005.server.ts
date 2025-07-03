import { env } from '~/services/env.server'
import type { StartBatchResponse } from '~/types'

export async function opprettBpen005(
  accessToken: string,
  behandlingsmaned: number,
  kjoeretidspunkt: string,
  begrensetUtplukk: boolean,
): Promise<StartBatchResponse> {
  const response = await fetch(
    `${env.penUrl}/api/aldersovergang/utplukk`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify({
        behandlingsmaned: behandlingsmaned,
        kjoeretidspunkt: kjoeretidspunkt,
        begrensetUtplukk: begrensetUtplukk,
      }),
    },
  )

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    throw new Error()
  }
}

export async function hentMuligeAldersoverganger(
  accessToken: string,
): Promise<MuligeAldersovergangerResponse> {
  const response = await fetch(
    `${env.penUrl}/api/aldersovergang/muligeAldersoverganger`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as MuligeAldersovergangerResponse
  } else {
    throw new Error()
  }
}

export type MuligeAldersovergangerResponse = {
  maneder: string[],
  erBegrensUtplukkLovlig: boolean,
  kanOverstyreBehandlingsmaned: boolean,
}