import { laasOppVedtak } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laas-opp-sak.laasOpp'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  return await laasOppVedtak(request, data.vedtakId)
}
