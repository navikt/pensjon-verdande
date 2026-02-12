import { bekreftOppdragsmeldingManuelt } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.bekreftOppdragsmeldingManuelt'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  return await bekreftOppdragsmeldingManuelt(request, data.vedtakId)
}
