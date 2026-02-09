import type { LoaderFunctionArgs } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { hentAggregerteFeilmeldinger } from '~/regulering/regulering.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await hentAggregerteFeilmeldinger(accessToken)
}
