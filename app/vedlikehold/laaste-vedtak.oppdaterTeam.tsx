import { requireAccessToken } from '~/services/auth.server'
import { oppdaterTeam } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.oppdaterTeam'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  await oppdaterTeam(accessToken, data.behandlingId, data.kravId, data.team)
  return null
}
