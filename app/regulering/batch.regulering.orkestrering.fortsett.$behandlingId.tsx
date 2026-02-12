import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import invariant from 'tiny-invariant'
import { fortsettOrkestrering } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.orkestrering.fortsett.$behandlingId'

export const action = async ({ params, request }: Route.ActionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)

  return await fortsettOrkestrering(accessToken, params.behandlingId)
}
