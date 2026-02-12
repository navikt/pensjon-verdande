import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import invariant from 'tiny-invariant'
import { pauseOrkestrering } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.orkestrering.pause.$behandlingId'

export const action = async ({ params, request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)

  invariant(params.behandlingId, 'Missing behandlingId param')

  return await pauseOrkestrering(accessToken, params.behandlingId)
}
