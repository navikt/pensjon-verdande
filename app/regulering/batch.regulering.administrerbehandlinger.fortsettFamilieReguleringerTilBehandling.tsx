import { fortsettFamilieReguleringerTilBehandling } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettFamilieReguleringerTilBehandling'

export const action = async ({ request }: Route.ActionArgs) => {
  return await fortsettFamilieReguleringerTilBehandling(request)
}
