import { settTilManuell } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laas-opp-sak.settTilManuell'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  return await settTilManuell(request, data.kravId)
}
