import { laasOpp } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.laasOpp'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  return await laasOpp(request, data.vedtakId)
}
