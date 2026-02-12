import { oppdaterTeam } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.oppdaterTeam'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  await oppdaterTeam(request, data.behandlingId, data.kravId, data.team)
  return null
}
