import { leggTilEkskluderteSaker } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.ekskludertesaker.leggTil'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  return await leggTilEkskluderteSaker(request, data.sakIder, data.kommentar)
}
