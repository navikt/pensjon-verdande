import { requireAccessToken } from '~/services/auth.server'
import { laasOppVedtak } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laas-opp-sak.laasOpp'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  return await laasOppVedtak(accessToken, data.vedtakId)
}
