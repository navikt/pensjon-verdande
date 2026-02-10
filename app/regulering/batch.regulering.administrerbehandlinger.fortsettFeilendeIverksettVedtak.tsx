import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { fortsettFeilendeIverksettVedtak } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettFeilendeIverksettVedtak'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await fortsettFeilendeIverksettVedtak(accessToken)
}
