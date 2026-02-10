import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { hentEksluderteSaker } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.ekskludertesaker.hent'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const accessToken = await requireAccessToken(request)
  return await hentEksluderteSaker(accessToken)
}
