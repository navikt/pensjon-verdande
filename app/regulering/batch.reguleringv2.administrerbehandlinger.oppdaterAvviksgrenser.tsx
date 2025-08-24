import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { oppdaterAvviksgrenser } from '~/regulering/regulering.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  const data = await request.json()
  return await oppdaterAvviksgrenser(accessToken, data.newAvviksgrenser)
}

