import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { fortsettNyeavviksgrenser } from '~/regulering/regulering.server'
import type { Route } from './+types/batch.regulering.administrerbehandlinger.fortsettNyAvviksgrenser'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await fortsettNyeavviksgrenser(accessToken)
}
