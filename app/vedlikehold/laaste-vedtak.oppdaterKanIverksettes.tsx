import { oppdaterKanIverksettes } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.oppdaterKanIverksettes'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.json()
  await oppdaterKanIverksettes(request, data.behandlingId, data.kravId, data.kanIverksettes)
  return null
}
