import type { ReguleringAktiveReferansebelop } from '~/regulering/regulering.types'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.uttrekk.hentAktiveReferansebelop'

export const loader = async ({ request }: Route.LoaderArgs) => {
  return await apiGet<ReguleringAktiveReferansebelop>('/api/vedtak/regulering/referansebelop', request)
}
