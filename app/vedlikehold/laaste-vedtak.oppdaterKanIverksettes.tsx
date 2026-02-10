import { requireAccessToken } from '~/services/auth.server'
import { oppdaterKanIverksettes } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.oppdaterKanIverksettes'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  await oppdaterKanIverksettes(accessToken, data.behandlingId, data.kravId, data.kanIverksettes)
  return null
}
