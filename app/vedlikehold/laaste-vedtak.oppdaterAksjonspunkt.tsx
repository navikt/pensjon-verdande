import { oppdaterAksjonspunkt } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.oppdaterAksjonspunkt'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  await oppdaterAksjonspunkt(request, data.behandlingId, data.kravId, data.aksjonspunkt)
  return null
}
