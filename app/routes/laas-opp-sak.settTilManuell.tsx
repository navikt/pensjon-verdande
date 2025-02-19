import type { ActionFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'
import type { LaasOppResultat } from '~/laas-opp.types'


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  return await settTilManuell(accessToken, data.kravId)
}

async function settTilManuell(
  accessToken: string,
  kravId: string,
): Promise<LaasOppResultat> {

  const response = await fetch(
    `${env.penUrl}/api/behandling/laas-opp/settTilManuell/${kravId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return {success: true}
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
}






