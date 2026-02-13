import { fjernEkskluderteSaker } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.ekskludertesaker.fjern'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  return await fjernEkskluderteSaker(request, data.sakIder)
}
