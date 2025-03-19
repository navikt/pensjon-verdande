import type { ActionFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import type { EkskluderteSakerResponse } from '~/regulering.types'


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()

  const ekskluderteSaker = data.saksnummerListe
    .split('\n')
    .map((t: string) => t.trim())
    .filter((t: string) => t !== '')
    .map(Number)

  return await oppdaterEkskluderteSaker(accessToken, ekskluderteSaker)
}

export const loader = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  return await hentEksluderteSaker(accessToken)
}


async function hentEksluderteSaker(
  accessToken: string,
): Promise<EkskluderteSakerResponse> {

  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/eksludertesaker`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as EkskluderteSakerResponse
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`)
  }
}

async function oppdaterEkskluderteSaker(
  accessToken: string,
  ekskluderteSaker: number[],
) {

  const response = await fetch(
    `${env.penUrl}/api/vedtak/regulering/eksludertesaker`,
    {
      method: 'POST',
      body: JSON.stringify(
        {
          ekskluderteSaker: ekskluderteSaker,
        },
      ),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return null
}



