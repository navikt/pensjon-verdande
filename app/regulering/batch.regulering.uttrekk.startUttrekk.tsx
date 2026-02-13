import { startUttrekk } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.uttrekk.startUttrekk'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  return await startUttrekk(request, data.satsDato)
}
