import { requireAccessToken } from '~/services/auth.server'
import { runUttrekk } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.runUttrekk'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)

  const nullstill = false
  await runUttrekk(accessToken, nullstill)
  return null
}
