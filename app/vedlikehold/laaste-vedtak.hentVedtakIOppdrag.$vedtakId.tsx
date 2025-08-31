import type { ActionFunctionArgs } from 'react-router'

import { requireAccessToken } from '~/services/auth.server'
import invariant from 'tiny-invariant'
import { getVedtakIOppdrag } from '~/vedlikehold/vedlikehold.server'


export const loader = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.vedtakId, 'Missing vedtakId param')
  const accessToken = await requireAccessToken(request)

  return await getVedtakIOppdrag(accessToken, params.vedtakId)
}

