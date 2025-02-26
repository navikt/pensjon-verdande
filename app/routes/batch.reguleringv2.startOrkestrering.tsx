import type { ActionFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'

export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)

  const data = await request.json()
  return await startOrkestrering(accessToken, data.antallFamilier)
}

async function startOrkestrering(
  accessToken: string,
  antallFamilier: string | undefined,
) {

  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/orkestrering/startv2`,
    {
      method: 'POST',
      body: JSON.stringify(
          {
            antallFamilier,
          }
        )
      ,
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
