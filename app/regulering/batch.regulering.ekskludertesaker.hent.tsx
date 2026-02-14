import type { Ekskluderinger } from '~/regulering/regulering.types'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.ekskludertesaker.hent'

export const loader = async ({ request }: Route.LoaderArgs) => {
  return await apiGet<Ekskluderinger>('/api/vedtak/regulering/eksludertesaker', request)
}
