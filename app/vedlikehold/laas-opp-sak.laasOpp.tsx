import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'
import { serverOnly$ } from 'vite-env-only/macros'


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  return await laasOppVedtak(accessToken, data.vedtakId)
}

const laasOppVedtak = serverOnly$(async(
  accessToken: string,
  vedtakId: string,
) => {

  const response = await fetch(
    `${env.penUrl}/api/behandling/laas-opp/laasOppVedtak/${vedtakId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return {success: true}
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
})
