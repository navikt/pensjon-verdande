import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { oppdaterAvviksgrenser } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.oppdaterAvviksgrenser'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)

  const data = await request.json()
  return await oppdaterAvviksgrenser(accessToken, data.newAvviksgrenser)
}
