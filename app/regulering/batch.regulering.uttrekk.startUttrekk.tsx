import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { startUttrekk } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.uttrekk.startUttrekk'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)

  const data = await request.json()
  return await startUttrekk(accessToken, data.satsDato)
}
