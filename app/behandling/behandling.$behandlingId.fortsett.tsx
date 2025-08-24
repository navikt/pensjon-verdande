import type { ActionFunctionArgs } from 'react-router';
import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { fortsettBehandling, getBehandling } from '~/services/behandling.server'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)
  const formData = await request.formData()
  const nullstillPlanlagtStartet = formData.get('nullstillPlanlagtStartet') === 'true'

  await fortsettBehandling(accessToken, params.behandlingId, nullstillPlanlagtStartet)

  return getBehandling(accessToken, params.behandlingId)
}
