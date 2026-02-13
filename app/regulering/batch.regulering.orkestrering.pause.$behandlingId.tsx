import invariant from 'tiny-invariant'
import { pauseOrkestrering } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.orkestrering.pause.$behandlingId'

export const action = async ({ params, request }: Route.ActionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  return await pauseOrkestrering(request, params.behandlingId)
}
