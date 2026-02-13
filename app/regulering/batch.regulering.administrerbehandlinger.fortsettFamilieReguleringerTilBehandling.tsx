import { apiPost } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettFamilieReguleringerTilBehandling'

export const action = async ({ request }: Route.ActionArgs) => {
  await apiPost('/api/vedtak/regulering/fortsett/familiereguleringertilbehandling', undefined, request)
  return true
}
