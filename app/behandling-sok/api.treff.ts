/**
 * Resource route for cursor-paginering av treff (POST).
 * Kalles via useFetcher fra hovedsiden når brukeren trykker «Last mer».
 */
import { data } from 'react-router'
import { apiPost } from '~/services/api.server'
import type { Treff } from './components/TreffTabell'
import type { TreffRequest } from './lib/request-builder'

export type TreffResponse = {
  treff: Treff[]
  nesteCursor: { opprettet: string; behandlingId: number } | null
}

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return data({ error: 'Method not allowed' }, { status: 405 })
  }
  let body: TreffRequest
  try {
    body = (await request.json()) as TreffRequest
  } catch {
    return data({ error: 'Ugyldig JSON-body' }, { status: 400 })
  }
  if (!body.behandlingType) {
    return data({ error: 'behandlingType er påkrevd' }, { status: 400 })
  }
  try {
    const res = await apiPost<TreffResponse>('/api/behandling/sok/treff', body, request)
    return data(res)
  } catch (e) {
    const status = (e as { data?: { status?: number } })?.data?.status ?? 500
    const msg = (e as { data?: { detail?: string } })?.data?.detail ?? 'Søket feilet'
    return data({ error: msg }, { status })
  }
}
