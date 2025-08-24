import type { ActionFunctionArgs } from 'react-router';


import { requireAccessToken } from '~/services/auth.server'
import { laasOpp } from '~/vedlikehold/vedlikehold.server'

export const action = async ({ request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)

  const data = await request.json()
  return await laasOpp(accessToken, data.vedtakId)
}

