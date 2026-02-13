import { endrePrioritetTilOnline } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.endrePrioritetOnline'

export const action = async ({ request }: Route.ActionArgs) => {
  return await endrePrioritetTilOnline(request)
}
