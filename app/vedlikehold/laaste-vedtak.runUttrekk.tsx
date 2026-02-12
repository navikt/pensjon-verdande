import { runUttrekk } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.runUttrekk'

export const action = async ({ request }: Route.ActionArgs) => {
  const nullstill = false
  await runUttrekk(request, nullstill)
  return null
}
