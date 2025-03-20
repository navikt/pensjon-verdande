import type { ActionFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await fortsettFamilieReguleringerTilBehandling(accessToken)
}

async function fortsettFamilieReguleringerTilBehandling(
  accessToken: string,
) {

    await fetch(
    `${env.penUrl}/api/vedtak/regulering/fortsett/familiereguleringertilbehandling`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  return true
}



