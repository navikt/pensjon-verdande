import type { ActionFunctionArgs } from 'react-router';
import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandling, } from '~/services/behandling.server'
import { sendTilOppdragPaNytt } from '~/behandling/iverksettVedtak.server'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)

  await sendTilOppdragPaNytt(accessToken, params.behandlingId)

  return getBehandling(accessToken, params.behandlingId)
}
