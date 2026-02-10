import { requireAccessToken } from '~/services/auth.server'
import { getUttrekkStatus } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/laaste-vedtak.uttrekkStatus'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const accessToken = await requireAccessToken(request)

  const behandlingId = new URL(request.url).searchParams.get('behandlingId') ?? ''

  return await getUttrekkStatus(accessToken, behandlingId)
}
