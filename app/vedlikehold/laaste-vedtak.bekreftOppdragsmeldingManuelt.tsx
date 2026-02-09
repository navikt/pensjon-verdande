import { requireAccessToken } from '~/services/auth.server'
import { bekreftOppdragsmeldingManuelt } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.bekreftOppdragsmeldingManuelt'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  return await bekreftOppdragsmeldingManuelt(accessToken, data.vedtakId)
}
