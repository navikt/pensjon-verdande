import { requireAccessToken } from '~/services/auth.server'
import { settTilManuell } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laas-opp-sak.settTilManuell'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  return await settTilManuell(accessToken, data.kravId)
}
