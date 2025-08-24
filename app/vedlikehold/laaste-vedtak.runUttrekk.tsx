import type { ActionFunctionArgs } from 'react-router';
import { env } from '~/services/env.server'
import { requireAccessToken } from '~/services/auth.server'
import { serverOnly$ } from 'vite-env-only/macros'

export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)

  const nullstill = false
  await runUttrekk(accessToken, nullstill)
  return null
}

const runUttrekk = serverOnly$(async (
  accessToken: string,
  nullstill: boolean,
)=> {

  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/run?nullstill=${nullstill}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    throw new Error()
  }
})
