import { apiGet } from '~/services/api.server'
import type { OpprettetPerDagResponse } from '~/types'
import type { Route } from './+types/opprettet-per-dag'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)
  const dager = Number.parseInt(searchParams.get('dager') ?? '30', 10)
  const fom = new Date()
  fom.setDate(fom.getDate() - dager)
  const fomStr = fom.toISOString().split('T')[0]

  return await apiGet<OpprettetPerDagResponse>(`/api/behandling/oppsummering-opprettet-per-dag?fom=${fomStr}`, request)
}
