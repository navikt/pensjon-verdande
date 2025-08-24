import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import { AvviksGrense } from '~/regulering.types'
import { serverOnly$ } from 'vite-env-only/macros'

export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)

  const data = await request.json()
  return await oppdaterAvviksgrenser(accessToken, data.newAvviksgrenser)
}

const oppdaterAvviksgrenser = serverOnly$(async(
  accessToken: string,
  newAvviksgrenser: AvviksGrense[],
) => {

  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/avviksgrenser`,
    {
      method: 'PUT',
      body: JSON.stringify(
          {
            avviksgrenser: newAvviksgrenser,
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
})
