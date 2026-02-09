import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { fortsettFeilendeFamilieReguleringer } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettFeilendeFamilieReguleringer'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await fortsettFeilendeFamilieReguleringer(accessToken)
}
