import type { ActionFunctionArgs } from 'react-router';


import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'
import { serverOnly$ } from 'vite-env-only/macros'


export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  await oppdaterTeam(accessToken, data.behandlingId, data.kravId, data.team)
  return null
}

const oppdaterTeam = serverOnly$(async(
  accessToken: string,
  behandlingId: string,
  kravId: string,
  team: string,
) => {
  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/team/${behandlingId}/${kravId}?team=${team}`,
    {
      method: 'PUT',
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
