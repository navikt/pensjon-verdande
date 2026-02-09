import type { LoaderFunctionArgs } from 'react-router'
import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { getVedtakIOppdrag } from '~/vedlikehold/vedlikehold.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.vedtakId, 'Missing vedtakId param')
  const accessToken = await requireAccessToken(request)

  return await getVedtakIOppdrag(accessToken, params.vedtakId)
}
