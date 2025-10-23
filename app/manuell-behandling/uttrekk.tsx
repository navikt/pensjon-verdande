import type { LoaderFunctionArgs } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
