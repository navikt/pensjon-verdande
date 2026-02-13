import { apiPost } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettFeilendeFamilieReguleringer'

export const action = async ({ request }: Route.ActionArgs) => {
  await apiPost('/api/vedtak/regulering/fortsett/familiereguleringer', {}, request)
  return true
}
