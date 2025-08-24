import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import { AggregerteFeilmeldinger, ReguleringStatistikk } from '~/regulering/regulering.types'
import { serverOnly$ } from 'vite-env-only/macros'


export const loader = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await hentReguleringStatistikk(accessToken)
}

const hentReguleringStatistikk = serverOnly$(async(
  accessToken: string,
): Promise<ReguleringStatistikk> => {

  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/arbeidstabell/statistikk`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as ReguleringStatistikk
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
})
