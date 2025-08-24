import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { hentReguleringStatistikk } from '~/regulering/regulering.server'


export const loader = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await hentReguleringStatistikk(accessToken)
}
