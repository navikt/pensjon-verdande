import { apiPut } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.endrePrioritetBatch'

export const action = async ({ request }: Route.ActionArgs) => {
  await apiPut('/api/vedtak/regulering/endre/prioritet/batch', undefined, request)
  return { success: true }
}
