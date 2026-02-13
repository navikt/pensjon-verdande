import { apiPost } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.uttrekk.oppdaterUttrekk'

export const action = async ({ request }: Route.ActionArgs) => {
  await apiPost('/api/vedtak/regulering/uttrekk/oppdater', undefined, request)
  return { success: true }
}
