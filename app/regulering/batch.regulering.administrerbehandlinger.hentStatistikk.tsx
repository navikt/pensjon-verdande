import type { ReguleringStatistikk } from '~/regulering/regulering.types'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.hentStatistikk'

export const loader = async ({ request }: Route.LoaderArgs) => {
  return await apiGet<ReguleringStatistikk>('/api/vedtak/regulering/arbeidstabell/statistikk', request)
}
