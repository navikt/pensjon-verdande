import type { ActionFunctionArgs } from 'react-router';
import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandling, taTilDebug } from '~/services/behandling.server'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)

  await taTilDebug(accessToken, params.behandlingId)

  return getBehandling(accessToken, params.behandlingId)
}
