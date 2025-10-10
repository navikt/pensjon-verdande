import { data } from 'react-router'
import { env } from '~/services/env.server'

export async function opprettOpptjeningsendringMandeligOmregning(
  accessToken: string,
  behandlingsmaned: number,
  kjoeretidspunkt: string,
): Promise<StartBatchResponse> {
  const response = await fetch(`${env.penUrl}/api/opptjening/mandeliguttrekk/opprett`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      behandlingsmaned: behandlingsmaned,
      kjoeretidspunkt: kjoeretidspunkt,
    }),
  })

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  } else {
    const text = await response.text()
    throw data(`Feil ved start av månedlig omregning. Feil var\n${text}`, {
      status: response.status,
    })
  }
}

export async function hentMuligeManedligeKjoringer(accessToken: string): Promise<MuligeManedligeKjoringerResponse> {
  const response = await fetch(`${env.penUrl}/api/opptjening/muligeManedligeKjoringer`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw data({ message: 'Feil ved henting av mulige månedlige kjøringer', detail: text }, { status: response.status })
  }

  return (await response.json()) as MuligeManedligeKjoringerResponse
}

export async function getSisteAvsjekk(accessToken: string): Promise<SisteAvsjekkResponse> {
  const response = await fetch(`${env.penUrl}/api/opptjening/sisteAvsjekk`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw data({ message: 'Feil ved henting av siste avsjekk', detail: text }, { status: response.status })
  }

  return (await response.json()) as SisteAvsjekkResponse
}

export const opprettAvsjekk = async (accessToken: string) => {
  const response = await fetch(`${env.penUrl}/api/opptjening/avsjekk`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw data({ message: 'Feil ved oppretting av avsjekk', detail: text }, { status: response.status })
  }
}

export type SisteAvsjekkResponse = {
  sisteAvsjekkTidspunkt: string
  antallHendelserPopp: number
  antallHendelserPen: number
  avsjekkOk: boolean
}

export type MuligeManedligeKjoringerResponse = {
  maneder: string[]
  kanOverstyreBehandlingsmaned: boolean
}

type StartBatchResponse = {
  behandlingId: number
}
