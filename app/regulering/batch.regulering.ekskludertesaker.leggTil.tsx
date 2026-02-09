import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { leggTilEkskluderteSaker } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.ekskludertesaker.leggTil'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)

  const data = await request.json()
  return await leggTilEkskluderteSaker(accessToken, data.sakIder, data.kommentar)
}
