import type { ActionFunctionArgs } from '@remix-run/node'


import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'

export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)

  const data = await request.json()
  return await laasOpp(accessToken, data.vedtakId)
}

async function laasOpp(
  accessToken: string,
  vedtakId: string,
) {

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
}


