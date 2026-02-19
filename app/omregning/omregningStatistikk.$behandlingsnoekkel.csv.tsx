import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'
import type { Route } from './+types/omregningStatistikk.$behandlingsnoekkel.csv'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const behandlingsNoekkel = params.behandlingsnoekkel
  const accessToken = await requireAccessToken(request)

  // Stream CSV directly from backend instead of loading into memory
  const url = `${env.penUrl}/api/behandling/omregning/statistikk/csv?behandlingsnoekkel=${behandlingsNoekkel}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15_000)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Response('CSV ikke funnet', { status: 404 })
      }
      throw new Response('Feil ved henting av CSV', { status: response.status })
    }

    // Stream the response body directly to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="omregningStatistikk-${behandlingsNoekkel}.csv"`,
      },
    })
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Response) {
      throw error
    }
    throw new Response('Feil ved henting av CSV', { status: 500 })
  }
}
