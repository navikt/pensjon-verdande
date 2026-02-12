import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { fortsettFamilieReguleringerTilBehandling } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettFamilieReguleringerTilBehandling'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await fortsettFamilieReguleringerTilBehandling(accessToken)
}
