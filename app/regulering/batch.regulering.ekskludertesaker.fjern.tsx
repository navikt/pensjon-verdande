import { apiPost } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.ekskludertesaker.fjern'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  await apiPost('/api/vedtak/regulering/eksludertesaker/fjern', { sakIder: data.sakIder }, request)
  return { erOppdatert: true }
}
