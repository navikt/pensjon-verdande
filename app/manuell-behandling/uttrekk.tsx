import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'
import type { Route } from './+types/uttrekk'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const incomingUrl = new URL(request.url)

  const accessToken = await requireAccessToken(request)

  const url = `${env.penUrl}/api/behandling/manuell-behandling/behandlinger?${incomingUrl.searchParams.toString()}`

  return await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })
}
