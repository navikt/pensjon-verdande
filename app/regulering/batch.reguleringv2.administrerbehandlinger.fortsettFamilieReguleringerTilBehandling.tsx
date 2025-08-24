import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { fortsettFamilieReguleringerTilBehandling } from '~/regulering/regulering.server'


export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await fortsettFamilieReguleringerTilBehandling(accessToken)
}
