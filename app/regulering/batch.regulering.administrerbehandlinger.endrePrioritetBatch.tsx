import { endrePrioritetTilBatch } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.endrePrioritetBatch'

export const action = async ({ request }: Route.ActionArgs) => {
  return await endrePrioritetTilBatch(request)
}
