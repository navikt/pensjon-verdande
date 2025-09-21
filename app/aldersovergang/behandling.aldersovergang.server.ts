import { data } from 'react-router'
import { env } from '~/services/env.server'

export async function opprettAldersovergang(
  accessToken: string,
  behandlingsmaned: number,
  kjoeretidspunkt: string,
  begrensetUtplukk: boolean,
): Promise<StartBatchResponse> {
  const response = await fetch(`${env.penUrl}/api/aldersovergang/utplukk`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      behandlingsmaned,
      kjoeretidspunkt,
      begrensetUtplukk,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw data(
      { message: 'Feil ved oppretting av aldersovergang behandling', detail: text },
      { status: response.status },
    )
  }

  return (await response.json()) as StartBatchResponse
}

export async function hentMuligeAldersoverganger(accessToken: string): Promise<MuligeAldersovergangerResponse> {
  const response = await fetch(`${env.penUrl}/api/aldersovergang/muligeAldersoverganger`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw data({ message: 'Feil ved henting av mulige aldersoverganger', detail: text }, { status: response.status })
  }

  return (await response.json()) as MuligeAldersovergangerResponse
}

export type MuligeAldersovergangerResponse = {
  maneder: string[]
  erBegrensUtplukkLovlig: boolean
  kanOverstyreBehandlingsmaned: boolean
}

type StartBatchResponse = {
  behandlingId: number
}
