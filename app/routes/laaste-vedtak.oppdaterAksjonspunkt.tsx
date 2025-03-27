import type { ActionFunctionArgs } from '@remix-run/node'


import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'


export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  await oppdaterAksjonspunkt(accessToken, data.behandlingId, data.kravId, data.aksjonspunkt)
  return null
}

async function oppdaterAksjonspunkt(
  accessToken: string,
  behandlingId: string,
  kravId: string,
  aksjonspunkt: string,
) {

  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/aksjonspunkt/${behandlingId}/${kravId}`,
    {
      method: 'PUT',
      body: aksjonspunkt,
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