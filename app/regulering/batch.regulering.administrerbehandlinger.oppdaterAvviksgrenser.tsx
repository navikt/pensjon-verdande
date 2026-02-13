import { oppdaterAvviksgrenser } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.oppdaterAvviksgrenser'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  return await oppdaterAvviksgrenser(request, data.newAvviksgrenser)
}
