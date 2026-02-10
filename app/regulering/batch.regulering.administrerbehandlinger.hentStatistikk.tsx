import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { hentReguleringStatistikk } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.hentStatistikk'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const accessToken = await requireAccessToken(request)
  return await hentReguleringStatistikk(accessToken)
}
