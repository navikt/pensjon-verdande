import type { BrevTidsserieResponse } from '~/analyse/types'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/brev-per-periode'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)
  const parsed = Number.parseInt(searchParams.get('timer') ?? '24', 10)
  const timer = Number.isFinite(parsed) && parsed > 0 && parsed <= 8760 ? parsed : 24

  const fom = new Date()
  fom.setTime(fom.getTime() - timer * 60 * 60 * 1000)

  const params = new URLSearchParams({
    fom: fom.toISOString().replace('Z', ''),
    tom: new Date().toISOString().replace('Z', ''),
    aggregering: 'TIME',
  })

  return await apiGet<BrevTidsserieResponse>(`/api/behandling/analyse/brev-tidsserie?${params}`, request)
}
