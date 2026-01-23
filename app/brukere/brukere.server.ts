import type { BrukerResponse, MeResponse, Tilgangsmeta } from '~/brukere/brukere'
import { apiDelete, apiGet, apiPut } from '~/services/api.server'

export async function hentTilgangskontrollMeta(request: Request) {
  return (
    await apiGet<{
      tilgangsmeta: Tilgangsmeta[]
    }>('/api/behandling/brukere/tilgangsmeta', request)
  ).tilgangsmeta
}

export async function hentBrukere(accessToken: string) {
  return (
    await apiGet<{
      brukere: BrukerResponse[]
    }>('/api/behandling/brukere/alle', { accessToken })
  ).brukere
}

export async function hentMe(request: Request) {
  return apiGet<MeResponse>('/api/behandling/brukere/me', request)
}

export async function hentBruker(request: Request, brukerIdent: string) {
  return apiGet<BrukerResponse>(`/api/behandling/brukere?brukernavn=${encodeURI(brukerIdent)}`, request)
}

export async function giBrukerTilgang(accessToken: string, brukernavn: string, operasjon: string) {
  await apiPut('/api/behandling/brukere/tilganger', { brukernavn, operasjon }, { accessToken })
}

export async function fjernBrukertilgang(accessToken: string, brukernavn: string, operasjon: string) {
  await apiDelete('/api/behandling/brukere/tilganger', { brukernavn, operasjon }, { accessToken })
}
