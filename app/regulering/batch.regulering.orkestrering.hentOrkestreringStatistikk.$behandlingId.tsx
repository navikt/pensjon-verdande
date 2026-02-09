import type { LoaderFunctionArgs } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import invariant from 'tiny-invariant'
import { hentOrkestreringsStatistikk } from '~/regulering/regulering.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')
  const accessToken = await requireAccessToken(request)

  return await hentOrkestreringsStatistikk(accessToken, params.behandlingId)
}
