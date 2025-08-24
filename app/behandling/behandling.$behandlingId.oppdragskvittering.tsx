import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import xmlFormat from 'xml-formatter'

import { getOppdragskvittering } from '~/services/behandling.server'

import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const output = await getOppdragskvittering(
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

export default function Oppdragskvittering() {
  const { output } = useLoaderData<typeof loader>()

  return (
    <pre>
      {xmlFormat(output)}
    </pre>
  )
}
