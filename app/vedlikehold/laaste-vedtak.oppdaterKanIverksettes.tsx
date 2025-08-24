import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { oppdaterKanIverksettes } from '~/vedlikehold/vedlikehold.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  await oppdaterKanIverksettes(accessToken, data.behandlingId, data.kravId, data.kanIverksettes)
  return null
}
