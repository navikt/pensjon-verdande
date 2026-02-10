import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { hentAggregerteFeilmeldinger } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.orkestrering.hentAggregerteFeilmeldinger'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const accessToken = await requireAccessToken(request)
  return await hentAggregerteFeilmeldinger(accessToken)
}
