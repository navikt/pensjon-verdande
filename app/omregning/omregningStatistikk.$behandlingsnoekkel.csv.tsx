import { apiGetStream } from '~/services/api.server'
import type { Route } from './+types/omregningStatistikk.$behandlingsnoekkel.csv'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const behandlingsNoekkel = params.behandlingsnoekkel

  const response = await apiGetStream(
    `/api/behandling/omregning/statistikk/csv?behandlingsnoekkel=${behandlingsNoekkel}`,
    request,
  )

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="omregningStatistikk-${behandlingsNoekkel}.csv"`,
    },
  })
}
