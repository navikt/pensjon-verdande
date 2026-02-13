import invariant from 'tiny-invariant'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.orkestrering.fortsett.$behandlingId'

export const action = async ({ params, request }: Route.ActionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  await apiPost(`/api/vedtak/regulering/orkestrering/${params.behandlingId}/fortsett`, undefined, request)
  return { success: true }
}
