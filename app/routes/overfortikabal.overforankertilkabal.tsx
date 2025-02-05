import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'
import { StartBatchResponse } from '~/types'
import OverforAnkerTilKabalBatch from '~/components/overfortilkabal-batch/overforankertilkabal-batch'


export const action = async ({ request }: LoaderFunctionArgs) => {

  const accessToken = await requireAccessToken(request)
  const formData = await request.json()

  console.log('formData', formData)

  const response = await fetch(
    `${env.penUrl}/api/anke/batch/opprett`,
    {
      method: 'POST',
      body: JSON.stringify(formData.request),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    const startBatchResponse = await response.json() as StartBatchResponse
    return redirect(`/behandling/${startBatchResponse.behandlingId}`)
  } else {
    throw new Error()
  }

}

export default function BatchOpprettOverfortilKabalRoute() {
  return (
    <OverforAnkerTilKabalBatch />
  )
}