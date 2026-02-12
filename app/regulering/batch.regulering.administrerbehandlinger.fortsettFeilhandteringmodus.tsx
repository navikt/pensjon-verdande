import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { fortsettFeilhandteringmodus } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettFeilhandteringmodus'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await fortsettFeilhandteringmodus(accessToken)
}
