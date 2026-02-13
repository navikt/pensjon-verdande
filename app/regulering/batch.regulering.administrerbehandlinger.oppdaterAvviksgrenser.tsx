import { apiPut } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.oppdaterAvviksgrenser'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  await apiPut('/api/vedtak/regulering/avviksgrenser', { avviksgrenser: data.newAvviksgrenser }, request)
  return { success: true }
}
