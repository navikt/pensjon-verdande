import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import invariant from 'tiny-invariant'
import { pauseOrkestrering } from '~/regulering/regulering.server'


export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)

  invariant(params.behandlingId, 'Missing behandlingId param')

  return await pauseOrkestrering(accessToken, params.behandlingId)
}
