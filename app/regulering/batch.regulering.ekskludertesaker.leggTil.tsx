import { apiPost } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.ekskludertesaker.leggTil'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  await apiPost(
    '/api/vedtak/regulering/eksludertesaker/leggTil',
    { sakIder: data.sakIder, kommentar: data.kommentar },
    request,
  )
  return { erOppdatert: true }
}
