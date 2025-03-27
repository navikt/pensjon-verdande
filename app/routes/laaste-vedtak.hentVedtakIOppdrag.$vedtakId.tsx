import { ActionFunctionArgs } from '@remix-run/node'


import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'
import { VedtakYtelsekomponenter } from '~/laaste-vedtak.types'
import invariant from 'tiny-invariant'


export const loader = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.vedtakId, 'Missing vedtakId param')
  const accessToken = await requireAccessToken(request)

  return await getVedtakIOppdrag(accessToken, params.vedtakId)
}

async function getVedtakIOppdrag(
  accessToken: string,
  vedtakId: string,
): Promise<VedtakYtelsekomponenter> {

  const response = await fetch(
    `${env.penUrl}/api/laaste-vedtak/hentVedtakIOppdrag/${vedtakId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as VedtakYtelsekomponenter
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`, )
  }
}

