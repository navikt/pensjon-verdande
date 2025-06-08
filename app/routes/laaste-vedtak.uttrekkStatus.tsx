import type { ActionFunctionArgs } from '@remix-run/node'
import type { LaasteVedtakUttrekkStatus } from '~/laaste-vedtak.types'

import { env } from '~/services/env.server'
import { requireAccessToken } from '~/services/auth.server'
import { logger } from '~/services/logger.server'
import { serverOnly$ } from 'vite-env-only/macros'


export const loader = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)

  const behandlingId = new URL(request.url).searchParams.get('behandlingId') ?? '';

  return await getUttrekkStatus(accessToken, behandlingId)
}

const getUttrekkStatus = serverOnly$(async(
  accessToken: string,
  behandlingId: string,
) => {

  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/status/${behandlingId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as LaasteVedtakUttrekkStatus
  } else {
    let body = await response.json()
    logger.error(`Feil ved kall til pen ${response.status}`, body)
    throw new Error()
  }
})
