import { apiGetStream } from '~/services/api.server'
import type { Route } from './+types/eksport'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { behandlingType, fom, tom, params: baseParams } = parseAnalyseParams(request)
  const url = new URL(request.url)
  const offset = url.searchParams.get('offset') || '0'
  const limit = url.searchParams.get('limit') || '1000'

  const params = new URLSearchParams(baseParams)
  params.set('offset', offset)
  params.set('limit', limit)
  const response = await apiGetStream(`/api/behandling/analyse/eksport/behandlinger?${params}`, request)

  const filename = `analyse-${behandlingType}-${fom}-${tom}.json`.replace(/[^a-zA-Z0-9._-]/g, '_')

  return new Response(response.body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
