import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { getVedtakIOppdrag } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.hentVedtakIOppdrag.$vedtakId'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.vedtakId, 'Missing vedtakId param')
  const accessToken = await requireAccessToken(request)

  return await getVedtakIOppdrag(accessToken, params.vedtakId)
}
