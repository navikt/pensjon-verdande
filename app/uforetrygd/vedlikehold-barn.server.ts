import { env } from '~/services/env.server'

export const hentPersonDetaljer = async (
  accessToken: string,
  sakId: string,
): Promise<PersonDetaljForVedlikehold[] | null> => {
  const response = await fetch(`${env.penUrl}/api/behandling/barngrunnlag/${sakId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })
  if (response.ok) {
    const text = await response.text()
    if (!text || text.trim() === '') {
      return []
    }
    return JSON.parse(text) as PersonDetaljForVedlikehold[]
  } else {
    return null
  }
}

export const oppdaterPersonDetalj = async (
  accessToken: string,
  personDetalj: PersonDetaljForVedlikehold[],
): Promise<void> => {
  const response = await fetch(`${env.penUrl}/api/behandling/barngrunnlag`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify(personDetalj),
  })

  if (!response.ok) {
    throw new Error(`Kunne ikke oppdatere barn. Statuskode: ${response.status}`)
  }
}

export type PersonDetaljForVedlikehold = {
  personDetaljId: string,
  persongrunnlagId: string,
  fnr: string,
  annenForelder: string,
  rolleFom: string,
  rolleTom?: string,
  vurdertTilBarnetillegg: boolean,
  kilde: string,
  bruk: boolean,
}