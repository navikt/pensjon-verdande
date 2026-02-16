import { apiPost } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettFaktoromregningsmodus'

export const action = async ({ request }: Route.ActionArgs) => {
  await apiPost('/api/vedtak/regulering/fortsett/nyeavviksgrenser/faktormodus', {}, request)
  return { success: true }
}
