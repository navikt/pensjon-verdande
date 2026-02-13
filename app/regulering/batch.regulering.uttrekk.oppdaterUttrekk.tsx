import { oppdaterUttrekk } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.uttrekk.oppdaterUttrekk'

export const action = async ({ request }: Route.ActionArgs) => {
  return await oppdaterUttrekk(request)
}
