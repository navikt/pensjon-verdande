import type { LoaderFunctionArgs } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { getUttrekkStatus } from '~/vedlikehold/vedlikehold.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  const behandlingId = new URL(request.url).searchParams.get('behandlingId') ?? ''

  return await getUttrekkStatus(accessToken, behandlingId)
}
