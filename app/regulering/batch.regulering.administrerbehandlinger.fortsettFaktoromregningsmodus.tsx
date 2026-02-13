import { fortsettFaktoromregningModus } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettFaktoromregningsmodus'

export const action = async ({ request }: Route.ActionArgs) => {
  return await fortsettFaktoromregningModus(request)
}
