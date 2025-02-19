import type { ActionFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'
import type { SakOppsummeringLaasOpp } from '~/laas-opp.types'


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  return await hentSak(accessToken, data.sakId)
}

async function hentSak(
  accessToken: string,
  sakId: string,
): Promise<SakOppsummeringLaasOpp | null> {

  const response = await fetch(
    `${env.penUrl}/api/behandling/laas-opp/hentSak`,
    {
      method: 'POST',
      body: JSON.stringify({ sakId }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
        'Content-Type': 'application/json',
      },
    },
  )

  if(response.status === 404) {
    return null
  }
  if (response.ok) {
    return await response.json() as SakOppsummeringLaasOpp
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
}






