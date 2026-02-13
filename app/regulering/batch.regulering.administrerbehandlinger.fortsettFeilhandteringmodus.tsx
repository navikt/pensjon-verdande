import { apiPost } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettFeilhandteringmodus'

export const action = async ({ request }: Route.ActionArgs) => {
  await apiPost('/api/vedtak/regulering/fortsett/faktorogfeilmodus', undefined, request)
  return true
}
