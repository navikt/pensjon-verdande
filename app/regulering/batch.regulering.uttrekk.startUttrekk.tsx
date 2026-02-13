import { apiPost } from '~/services/api.server'
import type { Route } from './+types/batch.regulering.uttrekk.startUttrekk'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  await apiPost('/api/vedtak/regulering/uttrekk/start', { satsDato: data.satsDato, reguleringsDato: data.satsDato }, request)
  return { success: true }
}
