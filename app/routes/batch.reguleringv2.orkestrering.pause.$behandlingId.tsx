import type { ActionFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import invariant from 'tiny-invariant'


export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)

  invariant(params.behandlingId, 'Missing behandlingId param')

  return await pauseOrkestrering(accessToken, params.behandlingId)
}

async function pauseOrkestrering(
  accessToken: string,
  behandlingId: string,
) {

  const response = await fetch(
    `${env.penUrl}/api/regulering/orkestrering/${behandlingId}/pause`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  return {
    success: response.ok,
  }
}


