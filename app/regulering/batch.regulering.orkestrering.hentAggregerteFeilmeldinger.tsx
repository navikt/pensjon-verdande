import { hentAggregerteFeilmeldinger } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.orkestrering.hentAggregerteFeilmeldinger'

export const loader = async ({ request }: Route.LoaderArgs) => {
  return await hentAggregerteFeilmeldinger(request)
}
