import { requireAccessToken } from '~/services/auth.server'
import { oppdaterKommentar } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.oppdaterKommentar'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  await oppdaterKommentar(accessToken, data.behandlingId, data.kravId, data.kommentar)
  return null
}
