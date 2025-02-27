import type { ActionFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import invariant from 'tiny-invariant'
import type { OrkestreringStatistikk } from '~/regulering.types'


export const loader = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')
  const accessToken = await requireAccessToken(request)

  return await hentOrkestreringsStatistikk(accessToken, params.behandlingId)
}

async function hentOrkestreringsStatistikk(
  accessToken: string,
  behandlingId: string,
): Promise<OrkestreringStatistikk> {

  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/orkestrering/${behandlingId}/detaljer`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as OrkestreringStatistikk
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
}


