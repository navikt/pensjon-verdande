import { requireAccessToken } from '~/services/auth.server'
import { oppdaterAksjonspunkt } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.oppdaterAksjonspunkt'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  await oppdaterAksjonspunkt(accessToken, data.behandlingId, data.kravId, data.aksjonspunkt)
  return null
}
