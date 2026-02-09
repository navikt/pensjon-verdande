import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import invariant from 'tiny-invariant'
import { hentOrkestreringsStatistikk } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.hentTotaloversiktBehandlinger.$behandlingId'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')
  const accessToken = await requireAccessToken(request)

  return await hentOrkestreringsStatistikk(accessToken, params.behandlingId)
}
