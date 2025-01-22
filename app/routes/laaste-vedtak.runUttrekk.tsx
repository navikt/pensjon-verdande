import type { ActionFunctionArgs } from '@remix-run/node'


import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'

export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)

  const nullstill = true
  await runUttrekk(accessToken, nullstill)
  return null
}

async function runUttrekk(
  accessToken: string,
  nullstill: boolean,
) {

  const response = await fetch(
    `${env.penUrl}/api/behandling/laaste-vedtak/run?nullstill=${nullstill}`,
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
}


