import type { ActionFunctionArgs } from '@remix-run/node'


import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'


export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  await oppdaterTeam(accessToken, data.behandlingId, data.kravId, data.team)
  return null
}

async function oppdaterTeam(
  accessToken: string,
  behandlingId: string,
  kravId: string,
  team: string,
) {

  const response = await fetch(
    `${env.penUrl}/api/behandling/laaste-vedtak/team/${behandlingId}/${kravId}?team=${team}`,
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
}