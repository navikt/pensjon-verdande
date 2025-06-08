import type { ActionFunctionArgs } from '@remix-run/node'
import { env } from '~/services/env.server'
import { requireAccessToken } from '~/services/auth.server'
import { serverOnly$ } from 'vite-env-only/macros'

export const action = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  await oppdaterKanIverksettes(accessToken, data.behandlingId, data.kravId, data.kanIverksettes)
  return null
}

const oppdaterKanIverksettes = serverOnly$(async(
  accessToken: string,
  behandlingId: string,
  kravId: string,
  kanIverksettes: string,
) => {

  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/iverksett/${behandlingId}/${kravId}?kanIverksettes=${kanIverksettes}`,
    {
      method: 'PUT',
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
})
