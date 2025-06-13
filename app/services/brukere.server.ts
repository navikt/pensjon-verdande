import { env } from '~/services/env.server'
import { BrukerResponse, MeResponse, Tilgangsmeta } from '~/types/brukere'
import { data } from 'react-router'

export async function hentTilgangskontrollMeta(
  accessToken: string,
) {
  const response = await fetch(
    `${env.penUrl}/api/behandling/brukere/tilgangsmeta`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return ((await response.json()) as {
      tilgangsmeta: Tilgangsmeta[]
    }).tilgangsmeta
  } else {
    throw new Error("Feil ved henting av tilgangsmeta fra pen. Feil var\n" + await response.text())
  }
}

export async function hentBrukere(
  accessToken: string,
) {
  const response = await fetch(
    `${env.penUrl}/api/behandling/brukere/alle`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json() as {
      brukere: BrukerResponse[]
    }).brukere
  } else {
    let text = await response.text()
    throw data("Feil ved henting av bruker fra pen. Feil var\n" + text, {
      status: response.status
    })
  }
}

export async function hentMe(
  accessToken: string,
) {
  const response = await fetch(
    `${env.penUrl}/api/behandling/brukere/me`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return await response.json() as MeResponse
  } else {
    throw new Error("Feil ved henting av 'me' bruker fra pen. Feil var\n" + await response.text())
  }
}

export async function hentBruker(
  accessToken: string,
  brukerIdent: string,
) {
  const response = await fetch(
    `${env.penUrl}/api/behandling/brukere?brukernavn=${encodeURI(brukerIdent)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return await response.json() as BrukerResponse
  } else {
    throw new Error("Feil ved henting av bruker fra pen. Feil var\n" + await response.text())
  }
}

export async function giBrukerTilgang(
  accessToken: string,
  brukernavn: string,
  operasjon: string,
) {
  const response = await fetch(
    `${env.penUrl}/api/behandling/brukere/tilganger`,
    {
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
    },
  )

  if (!response.ok) {
    throw data("Feil ved lagring av brukertilgang: " + await response.text())
  }
}

export async function fjernBrukertilgang(
  accessToken: string,
  brukernavn: string,
  operasjon: string,
) {
  const response = await fetch(
    `${env.penUrl}/api/behandling/brukere/tilganger`,
    {
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
    },
  )

  if (!response.ok) {
    throw data("Feil ved lagring av brukertilgang: " + await response.text())
  }
}
