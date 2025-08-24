import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import invariant from 'tiny-invariant'
import { fortsettOrkestrering } from '~/regulering/regulering.server'


export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)

  return await fortsettOrkestrering(accessToken, params.behandlingId)
}
