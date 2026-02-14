import { apiGetRawResponse } from '~/services/api.server'
import type { Route } from './+types/uttrekk'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const incomingUrl = new URL(request.url)
  const queryString = incomingUrl.searchParams.toString()
  const path = `/api/behandling/manuell-behandling/behandlinger${queryString ? `?${queryString}` : ''}`

  return await apiGetRawResponse(path, request)
}
