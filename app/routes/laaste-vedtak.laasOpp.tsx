import type { ActionFunctionArgs } from 'react-router';


import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'
import { serverOnly$ } from 'vite-env-only/macros'

export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)

  const data = await request.json()
  return await laasOpp(accessToken, data.vedtakId)
}

const laasOpp = serverOnly$(async(
  accessToken: string,
  vedtakId: string,
) => {

  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/laas-opp/${vedtakId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  return {
    success: response.ok,
  }
})
