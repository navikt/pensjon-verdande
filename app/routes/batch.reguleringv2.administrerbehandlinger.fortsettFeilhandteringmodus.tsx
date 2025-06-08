import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import { serverOnly$ } from 'vite-env-only/macros'


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await fortsettFeilhandteringmodus(accessToken)
}

const fortsettFeilhandteringmodus = serverOnly$(async(
  accessToken: string,
) => {
    await fetch(
    `${env.penUrl}/api/vedtak/regulering/fortsett/faktorogfeilmodus`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  return true
})
