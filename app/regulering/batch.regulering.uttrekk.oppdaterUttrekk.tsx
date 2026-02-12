import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { oppdaterUttrekk } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.uttrekk.oppdaterUttrekk'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)

  return await oppdaterUttrekk(accessToken)
}
