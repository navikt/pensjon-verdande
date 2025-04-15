import type { ActionFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import invariant from 'tiny-invariant'


export const action = async ({ params, request }: ActionFunctionArgs) => {

  invariant(params.behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)

  return await fortsettOrkestrering(accessToken, params.behandlingId)
}

async function fortsettOrkestrering(
  accessToken: string,
  behandlingId: string,
) {

  const response = await fetch(
    `${env.penUrl}/api/regulering/orkestrering/${behandlingId}/fortsett`,
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


