import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { fjernEkskluderteSaker } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.ekskludertesaker.fjern'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)

  const data = await request.json()
  return await fjernEkskluderteSaker(accessToken, data.sakIder)
}
