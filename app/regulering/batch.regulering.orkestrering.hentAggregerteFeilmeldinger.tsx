import type { AggregerteFeilmeldinger } from '~/regulering/regulering.types'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.orkestrering.hentAggregerteFeilmeldinger'

export const loader = async ({ request }: Route.LoaderArgs) => {
  return await apiGet<AggregerteFeilmeldinger>('/api/vedtak/regulering/aggregerteFeilmeldinger', request)
}
