import { oppdaterKommentar } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.oppdaterKommentar'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  await oppdaterKommentar(request, data.behandlingId, data.kravId, data.kommentar)
  return null
}
