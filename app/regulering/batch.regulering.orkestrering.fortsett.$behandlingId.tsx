import invariant from 'tiny-invariant'
import { fortsettOrkestrering } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.orkestrering.fortsett.$behandlingId'

export const action = async ({ params, request }: Route.ActionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  return await fortsettOrkestrering(request, params.behandlingId)
}
