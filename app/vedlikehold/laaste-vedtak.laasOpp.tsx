import { requireAccessToken } from '~/services/auth.server'
import { laasOpp } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.laasOpp'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)

  const data = await request.json()
  return await laasOpp(accessToken, data.vedtakId)
}
