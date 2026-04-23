/**
 * Resource route for «antall over tid»-søk (POST).
 * Brukes når sensitive kriterier holdes i sessionStorage og loaderen ikke kan kjøre søket
 * server-side på første render.
 */
import { data } from 'react-router'
import { apiPost } from '~/services/api.server'
import type { Bucket } from './components/AntallOverTidChart'
import type { AntallOverTidRequest } from './lib/request-builder'

export type AntallOverTidResponse = { totalAntall: number; buckets: Bucket[] }

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return data({ error: 'Method not allowed' }, { status: 405 })
  }
  let body: AntallOverTidRequest
  try {
    body = (await request.json()) as AntallOverTidRequest
  } catch {
    return data({ error: 'Ugyldig JSON-body' }, { status: 400 })
  }
  if (!body.behandlingType) {
    return data({ error: 'behandlingType er påkrevd' }, { status: 400 })
  }
  try {
    const res = await apiPost<AntallOverTidResponse>('/api/behandling/sok/antall-over-tid', body, request)
    return data(res)
  } catch (e) {
    const status = (e as { data?: { status?: number } })?.data?.status ?? 500
    const msg = (e as { data?: { detail?: string } })?.data?.detail ?? 'Søket feilet'
    return data({ error: msg }, { status })
  }
}
