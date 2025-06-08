import type { ActionFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import { AggregerteFeilmeldinger } from '~/regulering.types'
import { serverOnly$ } from 'vite-env-only/macros'


export const loader = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await hentAggregerteFeilmeldinger(accessToken)
}

const hentAggregerteFeilmeldinger = serverOnly$(async (
  accessToken: string,
): Promise<AggregerteFeilmeldinger> => {

  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/aggregerteFeilmeldinger`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
      priority: 'low'
    },
  )

  if (response.ok) {
    return (await response.json()) as AggregerteFeilmeldinger
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
})
