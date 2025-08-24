import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { runUttrekk } from '~/vedlikehold/vedlikehold.server'

export const action = async ({ request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)

  const nullstill = false
  await runUttrekk(accessToken, nullstill)
  return null
}

