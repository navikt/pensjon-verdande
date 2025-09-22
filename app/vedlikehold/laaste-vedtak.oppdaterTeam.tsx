import type { ActionFunctionArgs } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { oppdaterTeam } from '~/vedlikehold/vedlikehold.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  await oppdaterTeam(accessToken, data.behandlingId, data.kravId, data.team)
  return null
}
