import { apiGetRawStringOrUndefined } from '~/services/api.server'
import type { Route } from './+types/omregningStatistikk.csv'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)
  const behandlingsNoekkel = searchParams.get('behandlingsnoekkel') ?? 'not set'

  const csvContent = await apiGetRawStringOrUndefined(
    `/api/behandling/omregning/statistikk/csv?behandlingsnoekkel=${behandlingsNoekkel}`,
    request,
  )

  if (!csvContent) {
    throw new Response('CSV ikke funnet', { status: 404 })
  }

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="omregningStatistikk-${behandlingsNoekkel}.csv"`,
    },
  })
}
