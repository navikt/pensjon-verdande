import type { ActionFunctionArgs } from '@remix-run/node'


import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  return await bekreftOppdragsmeldingManuelt(accessToken, data.vedtakId)
}

async function bekreftOppdragsmeldingManuelt(
  accessToken: string,
  vedtakId: string,
): Promise<boolean> {

  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/bekreftOppdragsmeldingManuelt/${vedtakId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return true
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
}

