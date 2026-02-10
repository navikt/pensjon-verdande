import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { endrePrioritetTilBatch } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.endrePrioritetBatch'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await endrePrioritetTilBatch(accessToken)
}
