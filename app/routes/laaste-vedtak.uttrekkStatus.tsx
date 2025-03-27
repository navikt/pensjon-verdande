import { ActionFunctionArgs } from '@remix-run/node'


import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'
import { LaasteVedtakUttrekkStatus } from '~/routes/laaste-vedtak'


export const loader = async ({ params, request }: ActionFunctionArgs) => {

  const accessToken = await requireAccessToken(request)

  const behandlingId = new URL(request.url).searchParams.get('behandlingId') ?? '';

  return await getUttrekkStatus(accessToken, behandlingId)
}

async function getUttrekkStatus(
  accessToken: string,
  behandlingId: string,
): Promise<UttrekkStatus> {

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
    return (await response.json()) as UttrekkStatus
  } else {
    let body = await response.json()
    console.log(`Feil ved kall til pen ${response.status}`, body)
    throw new Error()
  }
}

