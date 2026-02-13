import { apiPut } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.endrePrioritetOnline'

export const action = async ({ request }: Route.ActionArgs) => {
  await apiPut('/api/vedtak/regulering/endre/prioritet/online', {}, request)
  return { success: true }
}
