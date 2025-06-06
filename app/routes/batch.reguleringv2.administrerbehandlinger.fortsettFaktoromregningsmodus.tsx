import type { ActionFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await fortsettFaktoromregningModus(accessToken)
}

async function fortsettFaktoromregningModus(
  accessToken: string,
) {

    await fetch(
    `${env.penUrl}/api/vedtak/regulering/fortsett/nyeavviksgrenser/faktormodus`,
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



