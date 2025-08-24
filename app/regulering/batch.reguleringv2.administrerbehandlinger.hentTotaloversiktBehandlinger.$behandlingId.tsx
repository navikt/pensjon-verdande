import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import invariant from 'tiny-invariant'
import { DetaljertFremdriftDTO } from '~/types'
import { serverOnly$ } from 'vite-env-only/macros'


export const loader = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')
  const accessToken = await requireAccessToken(request)

  return await hentOrkestreringsStatistikk(accessToken, params.behandlingId)
}

const hentOrkestreringsStatistikk = serverOnly$(async (
  accessToken: string,
  behandlingId: string,
): Promise<DetaljertFremdriftDTO> => {

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
    return (await response.json()) as DetaljertFremdriftDTO
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
})
