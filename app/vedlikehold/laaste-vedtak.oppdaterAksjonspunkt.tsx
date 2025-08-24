import type { ActionFunctionArgs } from 'react-router';


import { requireAccessToken } from '~/services/auth.server'
import { oppdaterAksjonspunkt } from '~/vedlikehold/vedlikehold.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  await oppdaterAksjonspunkt(accessToken, data.behandlingId, data.kravId, data.aksjonspunkt)
  return null
}
