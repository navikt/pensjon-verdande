import invariant from 'tiny-invariant'
import { getVedtakIOppdrag } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.hentVedtakIOppdrag.$vedtakId'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.vedtakId, 'Missing vedtakId param')
  return await getVedtakIOppdrag(request, params.vedtakId)
}
