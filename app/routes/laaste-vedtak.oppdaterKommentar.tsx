import type { ActionFunctionArgs } from '@remix-run/node'


import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'


export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  await oppdaterKommentar(accessToken, data.behandlingId, data.kravId, data.kommentar)
  return null
}

async function oppdaterKommentar(
  accessToken: string,
  behandlingId: string,
  kravId: string,
  kommentar: string,
) {

  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/kommentar/${behandlingId}/${kravId}`,
    {
      method: 'PUT',
      body: kommentar,
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