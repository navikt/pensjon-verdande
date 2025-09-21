import { data } from 'react-router'
import type { BrukerResponse, MeResponse, Tilgangsmeta } from '~/brukere/brukere'
import { apiGet } from '~/services/api.server'
import { env } from '~/services/env.server'

export async function hentTilgangskontrollMeta(request: Request) {
  return (
    await apiGet<{
      tilgangsmeta: Tilgangsmeta[]
    }>('/api/behandling/brukere/tilgangsmeta', request)
  ).tilgangsmeta
}

export async function hentBrukere(accessToken: string) {
  const response = await fetch(`${env.penUrl}/api/behandling/brukere/alle`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return (
      (await response.json()) as {
        brukere: BrukerResponse[]
      }
    ).brukere
  } else {
    const text = await response.text()
    throw data(`Feil ved henting av bruker fra pen. Feil var\n${text}`, {
      status: response.status,
    })
  }
}

export async function hentMe(request: Request) {
  return apiGet<MeResponse>('/api/behandling/brukere/me', request)
}

export async function hentBruker(request: Request, brukerIdent: string) {
  return apiGet<BrukerResponse>(`/api/behandling/brukere?brukernavn=${encodeURI(brukerIdent)}`, request)
}

export async function giBrukerTilgang(accessToken: string, brukernavn: string, operasjon: string) {
  const response = await fetch(`${env.penUrl}/api/behandling/brukere/tilganger`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      brukernavn: brukernavn,
      operasjon: operasjon,
    }),
  })

  if (!response.ok) {
    throw data(`Feil ved lagring av brukertilgang: ${await response.text()}`)
  }
}

export async function fjernBrukertilgang(accessToken: string, brukernavn: string, operasjon: string) {
  const response = await fetch(`${env.penUrl}/api/behandling/brukere/tilganger`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify({
      brukernavn: brukernavn,
      operasjon: operasjon,
    }),
  })

  if (!response.ok) {
    throw data(`Feil ved lagring av brukertilgang: ${await response.text()}`)
  }
}
