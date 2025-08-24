import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import invariant from 'tiny-invariant'
import { serverOnly$ } from 'vite-env-only/macros'


export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)

  invariant(params.behandlingId, 'Missing behandlingId param')

  return await pauseOrkestrering(accessToken, params.behandlingId)
}

const pauseOrkestrering = serverOnly$(async(
  accessToken: string,
  behandlingId: string,
) => {

  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/orkestrering/${behandlingId}/pause`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )


  if(response.ok) {
    return {success: true}
  } else {
    const error = await response.text()
    throw new Error(error)
  }
})
