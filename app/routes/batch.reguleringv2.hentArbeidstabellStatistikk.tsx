import type { ActionFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import type { AggregertStatistikk } from '~/regulering.types'


export const loader = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await hentArbeidstabellStatistikk(accessToken)
}

async function hentArbeidstabellStatistikk(
  accessToken: string,
): Promise<AggregertStatistikk> {

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
    return (await response.json()) as AggregertStatistikk
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
}


