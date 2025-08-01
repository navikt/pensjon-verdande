import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import { serverOnly$ } from 'vite-env-only/macros'

export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)

  const data = await request.json()
  return await startUttrekk(accessToken, data.satsDato)
}

const startUttrekk = serverOnly$(async(
  accessToken: string,
  satsDato: string,
) => {
  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/uttrekk/start`,
    {
      method: 'POST',
      body: JSON.stringify(
          {
            satsDato,
            reguleringsDato: satsDato,
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
