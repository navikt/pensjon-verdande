import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import xmlFormat from 'xml-formatter'

import { getOppdragsmelding } from '~/services/behandling.server'

import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const output = await getOppdragsmelding(
    await requireAccessToken(request),
    params.behandlingId,
  )

  if (!output) {
    throw new Response('Not Found', { status: 404 })
  } else {
    return {
      output,
    }
  }
}

export default function Oppdragsmelding() {
  const { output } = useLoaderData<typeof loader>()

  return (
    <pre>
      {xmlFormat(output)}
    </pre>
  )
}
