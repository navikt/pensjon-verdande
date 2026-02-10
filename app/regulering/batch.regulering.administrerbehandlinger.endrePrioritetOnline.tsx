import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { endrePrioritetTilOnline } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.endrePrioritetOnline'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await endrePrioritetTilOnline(accessToken)
}
